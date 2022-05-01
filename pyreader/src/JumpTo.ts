import * as vscode from 'vscode';

// this function will take input directly from parser and generate html code
export function jumpTo(line: number, editor: vscode.TextEditor) {
	
	// Offset by 1
	line = line - 1;

	// get the active text editor (Check if it's valid and not undefined)
	if(editor)
	{
		vscode.window.showTextDocument(editor.document, {
			viewColumn: vscode.ViewColumn.One,
			selection: new vscode.Selection(
				editor.document.lineAt(line).range.start,
				editor.document.lineAt(line).range.end
			)
		});
	}
}