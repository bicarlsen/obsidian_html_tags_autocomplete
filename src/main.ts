import {
	Plugin,
} from 'obsidian';

import EditorSuggestor from './editor_suggest';
import * as commands from './commands';


export default class HtmlTagsAutocomplete extends Plugin {

	async onload() {
		this.registerEditorSuggest( new EditorSuggestor( this.app ) );
		this.addCommand( commands.skip_over_tag_forward );
		this.addCommand( commands.skip_over_tag_backward );
		this.addCommand( commands.to_matching_tag );
	}

	onunload() {
	}
}