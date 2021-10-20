import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface HtmlTagsAutocompleteSettings {
	debug_mode: boolean;
}

const DEFAULT_SETTINGS: HtmlTagsAutocompleteSettings = {
	debug_mode: false
}

export default class HtmlTagsAutocomplete extends Plugin {
	private listening: boolean;
	private tag: string = '';
	private tag_pattern: RegExp;

	settings: HtmlTagsAutocompleteSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new HtmlTagsAutocompleteSettingTab(this.app, this));

		this.registerCodeMirror( ( editor ) => {
			editor.on( 'keypress', this.keyPressListener );
		} );

		this.tag_pattern = /[\w\d]/i

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private keyPressListener = (
		editor: CodeMirror.Editor,
		event: KeyboardEvent
	) => {
		const key = event.key;

		if ( key === '<' ) {
			// opening tag
			if ( this.listening ) {
				// invalid tag, ignore
				if ( this.settings.debug_mode ) {
					console.log( 'Invalid tag key.' );
				}

				this.reset();
				return;
			}

			this.listening = true;
		}

		else if ( this.listening && ( key === '>' ) ) {
			// ending tag
			if ( this.settings.debug_mode ) {
				console.log( `Inserting tag: ${this.tag}.` );
			}

			const pos = editor.getCursor();
			editor.replaceRange( `</${this.tag}>`, pos );
			
			// reset cursor to original position inside tag
			editor.setCursor( pos ); 
			
			this.reset();
			return;
		}

		else if ( this.listening ) {
			if ( this.tag_pattern.test( key ) ) {
				// valid tag key
				if ( this.settings.debug_mode ) {
					console.log( `Key match: ${key}.` );
				}

				this.tag += key;
			}
			else {
				// invalid tag key
				if ( this.settings.debug_mode ) {
					console.log( 'Invalid tag key.' );
				}

				this.reset()
				return;
			}
		}

	}


	private reset = () => {
		this.listening = false;
		this.tag = '';
	}
}

class HtmlTagsAutocompleteSettingTab extends PluginSettingTab {
	plugin: HtmlTagsAutocomplete;

	constructor(app: App, plugin: HtmlTagsAutocomplete) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Developer settings'});

		new Setting(containerEl)
			.setName('Debug mode')
			.setDesc('Log debug messages to the console.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.debug_mode)
				.onChange(async (value) => {
					this.plugin.settings.debug_mode = value;
					await this.plugin.saveSettings();
				}));
	}
}
