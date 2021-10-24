import {
	App,
	TFile,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestTriggerInfo,
	EditorSuggestContext
} from 'obsidian';

import {
	cursorTag,
	matchingTag,
	isOpeningTag
} from './common';


export default class HtmlTagsAutocompleteSuggestor extends EditorSuggest<string> {

	constructor( app: App ) {
		super( app );
	}

	onTrigger( cursor: EditorPosition, editor: Editor, file: TFile ): EditorSuggestTriggerInfo | null {
		if ( cursor.ch === 0 ) {
			// at beginning of line,
			// can't be in a tag
			return null;
		}
		console.log( editor.transaction )
		const cursor_tag = cursorTag( cursor, editor );
		if ( !cursor_tag ) {
			return null;
		}

		const pair_tag = matchingTag( cursor_tag );
		if ( !pair_tag && isOpeningTag( cursor_tag ) ) {
			// opening tag without matching close
			return {
				start: { line: cursor.line, ch: cursor_tag.index },
				end: { line: cursor.line, ch: cursor_tag.index + cursor_tag[ 0 ].length },
				query: `</${cursor_tag[ 2 ]}>`
			};
		}
		
		return null;
	}

	getSuggestions( context: EditorSuggestContext ): string[] | Promise<string[]> {
		return [ `${context.query}` ];
	}

	renderSuggestion( value: string, el: HTMLElement ) {
		const suggestion = document.createElement( 'p' );
		suggestion.innerText = value;

		el.appendChild( suggestion  );
	}

	selectSuggestion( value: string, event: MouseEvent | KeyboardEvent ) {
		const cursor = this.context.editor.getCursor();
		const insert_pos = {
			line: cursor.line,
			ch: cursor.ch
		};

		this.context.editor.replaceRange( value, insert_pos );
		this.context.editor.setSelection( cursor );  // place cursor between tags
	}
}