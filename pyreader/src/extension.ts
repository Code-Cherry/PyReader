// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { pythonNode } from "./pythonProcess";
import { PanelManager } from './panelManager';

var panelManager: PanelManager = new PanelManager;
var cont: vscode.ExtensionContext;

export function getContext() {
	return cont;
}

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('pyreader.helloWorld', () => {

		cont = context;
		
		var editor = vscode.window.activeTextEditor;

		if (editor) {
			pythonNode(editor.document.getText(), panelManager);
		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
