import * as cp from 'child_process';
import * as path from 'path';

const isWindows = process.platform === 'win32';
const playerWindowsPath = path.join(__dirname, 'audio', 'sounder.exe');
const soundPath = path.join(__dirname, 'audio', 'pop.wav');
const soundVolume = "30";

// use child process to make a sound by running exe
export function playSound() {
  console.log(playerWindowsPath);
  if (isWindows) {
    cp.execFile(playerWindowsPath, ['/vol', soundVolume, soundPath], (err, stdout, stderr) => {
    if (err) {
      //console.error(err);
      return;
      }
    });
  } 
  else {
  // the linux/osx way, maybe?
  cp.execFile('afplay', ['/vol', soundVolume, soundPath], (err, stdout, stderr) => {
    if (err) {
      //console.error(err);
      return;
      }
    });
  }
}

