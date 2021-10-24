import {
	Editor,
	MarkdownView
} from 'obsidian';

import {
	cursorTag,
	matchingTag
} from './common';


/*********************
 * Skip Tags
 *********************/
const canSkipOverTag = (
	checking: boolean,
	editor: Editor,
	forward: boolean
): boolean => {

	const cursor = editor.getCursor();
	const cursor_tag = cursorTag( cursor, editor, forward );
	if ( !cursor_tag ) {
		return false;
	}

	if( checking ) {
		if ( forward ) {
			return ( cursor.ch < cursor_tag.index + cursor_tag[ 0 ].length );
		}

		return ( cursor_tag.index <= cursor.ch );
	}

	return skipOverTag( cursor, editor, cursor_tag, forward );
};


const canSkipOverTagForward = (
	checking: boolean,
	editor: Editor,
	view: MarkdownView
): boolean => {
	return canSkipOverTag( checking, editor, true );
};


const canSkipOverTagBackward = (
	checking: boolean,
	editor: Editor,
	view: MarkdownView
): boolean => {
	return canSkipOverTag( checking, editor, false );
};


const skipOverTag = (
	cursor: EditorPosition,
	editor: Editor,
	cursor_tag: RegExpMatchArray,
	forward: boolean = true
): boolean => {
	const ch = (
		forward ?
		cursor_tag.index + cursor_tag[ 0 ].length:
		cursor_tag.index
	);

	editor.setCursor( { line: cursor.line, ch: ch } );
	return true;
}


export const skip_over_tag_forward = {
	id: 'html_autocomplete_tags-skip_over_tag_forward',
	name: 'Skip over tag forward',
	editorCheckCallback: canSkipOverTagForward,
	hotKeys: [
		{ modifiers: [ 'Ctrl', 'Shift' ], key: 39 }   // right arrow
	]
};

export const skip_over_tag_backward = {
	id: 'html_autocomplete_tags-skip_over_tag_backward',
	name: 'Skip over tag backward',
	editorCheckCallback: canSkipOverTagBackward,
	hotKeys: [
		{ modifiers: [ 'Ctrl', 'Shift' ], key: 37 }  // left arrow 
	]
};


/*********************
 * Matching Tags
 *********************/

const canGoToMatchingTag = (
	checking: boolean,
	editor: Editor,
	view: MarkdownView
): boolean => {
	const cursor = editor.getCursor();
	const cursor_tag = cursorTag( cursor, editor, true );
	if ( !cursor_tag ) {
		return false;
	}

	const pair_tag = matchingTag( cursor_tag );
	if ( !pair_tag ) {
		return false;
	}

	if( checking ) {
		return true;
	}

	// jump inside of tag
	let ch = pair_tag.index; 
	if ( cursor_tag.index > pair_tag.index ) {  
		// jumping backward		
		ch += pair_tag[ 0 ].length;
	}
	editor.setCursor( { line: cursor.line, ch: ch } );
};


export const to_matching_tag = {
	id: 'html_autocomplete_tags-to_matching_tag',
	name: 'To matching tag',
	editorCheckCallback: canGoToMatchingTag,
	hotKeys: [
		{ modifiers: [ 'Ctrl' ], key: 'm' } 
	]
};