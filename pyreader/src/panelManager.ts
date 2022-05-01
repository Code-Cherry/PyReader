import * as vscode from 'vscode';
import { jumpTo } from './JumpTo';
import { getContext } from './extension';

export class PanelManager {
	// This class is for managing multiple webview panels, including creating, updating, deleting, and handling messages
	// The main function you need to call is createOrUpdate.
	panels: OutlinePanel[] = [];
	constructor() {

	}

	createOrUpdate(currentEditor: vscode.TextEditor, html: string): void {
		// checks if panel already exists for the document, then either creates a new one and adds it to the panels or updates
		var create = true;
		var currentPanel : OutlinePanel | undefined = undefined;
		this.panels.forEach(panel => {
			if (panel.document === currentEditor.document) {
				create = false;
				panel.setHTML(html);
				currentPanel = panel;
				vscode.window.showInformationMessage("Pyreader Outline Updated");
				console.log("Existing Panel Updated");
			}
		});
		if (create) {
			currentPanel = new OutlinePanel(this.createWebviewPanel(currentEditor), currentEditor.document, html);
			this.panels.push(currentPanel);
			vscode.window.showInformationMessage("Pyreader Outline Generated");
			console.log("New Panel Created");
		}
		
		// Handle messages from the webview
		currentPanel?.panel.webview.onDidReceiveMessage(
			message => {
			switch (message.command) {
				case 'alert':
					console.log(message.text);
					// Open editor using the editor variable
					if(currentEditor){
						jumpTo(message.text, currentEditor);
					}
						
					return;
			}
			},
			undefined,
			undefined
		);

		// When the panel is closed, remove from panels
		currentPanel?.panel.onDidDispose(
			() => {
				if (currentPanel !== undefined) {
					var ind = this.panels.indexOf(currentPanel);
					this.panels.splice(ind, 1); // remove from panels list
					console.log("Panel closed");
				}
			},
			null,
			getContext().subscriptions
		  );
	}

	private createWebviewPanel(currentEditor: vscode.TextEditor | undefined): vscode.WebviewPanel {
		// returns the vs code webview panel
		// Decide on panel name
		var path = currentEditor?.document.fileName;
		var filename = path?.replace(/^.*[\\\/]/, '');
		var panelName = filename?.substr(0, filename?.lastIndexOf(".")) + " PyReader";

		// Get the view column setting to use for output
		var configSettings = vscode.workspace.getConfiguration('pyreader').get('outputPos');

		// Default option
		var viewValue = vscode.ViewColumn.One;
		if(configSettings === 'Side Bar') {
			viewValue = vscode.ViewColumn.Beside;

		}
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'pyreader', // Identifies the type of the webview. Used internally
			`${panelName}`, // Title of the panel displayed to the user
			viewValue, // Editor column to show the new webview panel in.
			{ // Webview options
				// Enable scripts in the webview
				enableScripts: true
			}
		);
		return panel;
	}
	
}

class OutlinePanel {
	// this is a data type to be used by panelmanager for the list of panels
	panel: vscode.WebviewPanel;
	document: vscode.TextDocument;

	constructor(panel: vscode.WebviewPanel, document: vscode.TextDocument, html: string | undefined) {
		this.panel = panel;
		this.document = document;
		this.panel.webview.html = (html === undefined) ? "" : html;
	}


	setHTML(html: string): void {
		this.panel.webview.html = html;
	}
	
}