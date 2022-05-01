import * as vscode from 'vscode';
import { PanelManager } from './panelManager';


// this function will take the generated html code and render it to the user
export function renderHTML(htmlCode: string, panelManager: PanelManager) {
	var currentEditor = vscode.window.activeTextEditor;
	if (currentEditor !== undefined) {
		panelManager.createOrUpdate(currentEditor, htmlCode);
	} else {
		console.log("Editor not defined");
	}
}