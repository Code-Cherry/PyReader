import {PythonShell} from 'python-shell';
import { generateHTML } from './generateHTML';
import { renderHTML } from './renderHTML';
import { playSound } from './playSound';
import { PanelManager } from './panelManager';
import * as vscode from 'vscode';

export function pythonNode(text: string, panelManager: PanelManager) {

  console.log("Running python shell...");

  // Get options from settings
  var configSettings = vscode.workspace.getConfiguration('pyreader').get('outputSound');
  
  var options = {
    // To say that the python script is in the src dir
    scriptPath: __dirname,
    // inputting the script we want to parse as command line arg
    args: [text],
    // we want output to be formatted as json
    mode: "json" as const
  };

  // If we're going to compile this, change src to out
  PythonShell.run('../out/parsingScript.py', options, function (err, results) {
    if (err){
      console.log(err);
    }

    // Check if results is valid (not null)
    if(results){
      console.log("Results found");
      /*
      // log every result to the console
      for (var i = 0; i < results.length; i++) {
        console.log(results[i]);
      }
      */

      // Display results into an html file
      let htmlCode = generateHTML(results);
      renderHTML(htmlCode, panelManager);

      // Play a sound if enabled
      if(configSettings){
        playSound();
      }
    } else {
      console.log('No results found');
    }


    // results is an array consisting of messages collected during execution
    //console.log('results: %j', results);
  });
}

