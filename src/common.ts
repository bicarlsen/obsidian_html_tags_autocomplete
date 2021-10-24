import {
	Editor,
	EditorPosition,
} from 'obsidian';




/**
 * Gets the tag associatated with the cursor.
 * 
 * @returns RegExp match relative to the line if an associated tag is found,
 * 			otherwise, return null.
 * 			An associated tag is one the cursor is in, or just outside of the closing '>'.
 * 			The RegExp match has two groups:
 * 				1. '/' if the tag is a closing tag, otherwise ''
 * 				2. The name of the tag.
 */
export function cursorTag( cursor: EditorPosition, editor: Editor ): RegExpMatchArray | null {

	const valid_tag_pattern = new RegExp( /<(\/?)([\w|\d|\-]+)>/ );

	// split text at cursor
	const line = editor.getLine( cursor.line );
	const line_split = ( line[ cursor.ch - 1 ] === '<' ) ? cursor.ch : cursor.ch - 1;

	const start_index = line.lastIndexOf( '<', line_split );
	const end_index = line.indexOf( '>', line_split );

	const tag_match = valid_tag_pattern.exec(
		line.slice( start_index, end_index + 1 )
	);

	if ( !tag_match ) {
		return null;
	}
	if ( start_index + tag_match.index + tag_match[ 0 ].length <= line_split ) {
		// cursor outside of tag
		return null;
	}

	// modify match to be relative to line
	tag_match.index += start_index;
	tag_match.input = line;

	return tag_match;
}


/**
 * Get the matching tag associated to the given tag.
 * 
 * @returns RegExp match relative to the line if a matching tag is found,
 * 			otherwise, return null.
 */
export function matchingTag( cursor_tag: RegExpMatchArray ): RegExpMatchArray | null {
	let start: number,
		end: number,
		pair_tag_pattern: RegExp;

	if ( isOpeningTag( cursor_tag ) ) {
		start = cursor_tag.index + cursor_tag[ 0 ].length + 1;
		end = undefined;
		pair_tag_pattern = new RegExp( `<\\/${cursor_tag[ 2 ]}>` );
	}	
	else {
		start = 0;
		end = cursor_tag.index;
		pair_tag_pattern = new RegExp( `<${cursor_tag[ 2 ]}>` );
	}

	const pair_match = pair_tag_pattern.exec( cursor_tag.input.slice( start, end ) );
	if ( !pair_match ) {
		return null;
	}

	// modify match to be relative to line
	pair_match.input = cursor_tag.input;
	pair_match.index += start;
	return pair_match;
}


/**
 * Check if given tag is an opening tag.
 * 
 * @param tagMatch Should be a match from #cursorTag or #matchingTag.
 */
export function isOpeningTag( tag_match: RegExpMatchArray ): boolean {
	return !tag_match[ 1 ];
}