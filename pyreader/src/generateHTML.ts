import * as vscode from 'vscode';

// here is where we define what we want to extract from each declaration
interface Declaration {
	name: string;
	line: number;
	type: string;
	level: number; // for indentation level
	parentLevel: number; // indentation of parent
	size?: number; // ? next to paramter name means optional
}

// Get the unit number of spaces in the Python file
// Since python allows users to choose the number of spaces for an indent, we have to find that number w/ file
function determineMinIndent(decs: Declaration[]) {

	var spaces: number[] = [];

	decs.forEach(dec => {
		var numSpaces = dec.level;
		// Add to array
		if(numSpaces){
			spaces.push(numSpaces);
		}
	});

	// Sort array
	spaces.sort();

	var minDiff = Infinity;
	// Find smallest difference
	for (let i = 0; i < spaces.length - 1; i++) {
		if (spaces[i] !== spaces[i + 1]) {
			var diff = Math.abs(spaces[i] - spaces[i + 1]);
			if (diff < minDiff) { minDiff = diff; }
		}
	}

	// If we get here, there is only one indentation level (Prevents divide by 0 error)
	if (minDiff === 0 || minDiff === Infinity) { minDiff = 1; }
	return minDiff;
}

// this function will take input directly from parser and generate html code
export function generateHTML(decs: Declaration[]) {

	// OPTIONAL: Sort decs by line
	decs.sort((a, b) => {
		return a.line - b.line;
	});

	// Determine indentation level
	var unitSpaces = determineMinIndent(decs);
	console.log("Unit Spaces: ", unitSpaces);

	// create html file using decs and output it as a file
	var htmlCode = "<html><body><h1> Results </h1><ul>";
	decs.forEach(dec => {
		var headerLevel = 1;
		if (dec.parentLevel >= 0) {
			headerLevel += dec.parentLevel / unitSpaces + 1;
		}
		// Header levels can only go up to 6
		if (headerLevel > 6) {
			headerLevel = 6;
		}

		var headerHTML = "h" + headerLevel;

		htmlCode += "<" + headerHTML + " onclick=\"jumpTo(" + dec.line + ")\">";
		htmlCode += dec.name + ", Line " + dec.line + ", Type: " + dec.type;
		if (dec.size !== undefined) { htmlCode += ", Size " + dec.size; }
		htmlCode += "</" + headerHTML + ">\n";
	});


	// this script will send the clicked line number to the VS Code api as a message
	htmlCode += `
	</ul>
	<script>
	const vscode = acquireVsCodeApi();

	function jumpTo(lineno) {
		vscode.postMessage({
			command: 'alert',
			text: lineno
		})
	}
	</script>`;
	htmlCode += "</body></html>";

	return htmlCode;
}