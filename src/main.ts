import {
	Plugin,
} from 'obsidian';

import EditorSuggestor from './editor_suggest';


export default class HtmlTagsAutocomplete extends Plugin {

	async onload() {
		this.registerEditorSuggest( new EditorSuggestor( this.app ) );
	}

	onunload() {
	}
}