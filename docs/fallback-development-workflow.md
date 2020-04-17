Fallback Development Workflow
=============================

The Calypso build has two outputs: **evergreen**, for browsers that are always kept up to date aka "evergreen"; and **fallback**, for all other browsers.

## Build

Running `yarn start-fallback` will do the "fallback" build of all the code and continuously watch the front-end JS and CSS/Sass for changes and rebuild accordingly.

You may need to run `yarn clean` between evergreen and fallback debug sessions.

## Debugging with Internet Explorer

If you aren't running Windows, it's possible to run the fallback build in IE using a free VM.

### 1. Install Microsoft's testing VM

Install Virtual Box and grab a copy of [Microsoft’s testing VM for IE and legacy Edge](https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/).

This is a Windows image that can be used for development and testing purposes. **The password for the VM is on the download page**.

### 2. Edit `hosts` file

The VM's network uses NAT mode by default, which means the host machine is accessible at `10.0.2.2` (this is the Virtual Box default).

1. Launch the VM
2. Open the Start menu and search for "Notepad"
3. Right-click Notepad and "Run as administrator"
4. Use the "File" menu to open `C:\Windows\System32\drivers\etc\hosts` (you may need to change the "Text Documents" filter to "All Files")
5. Add a `10.0.2.2 calypso.localhost` entry and save.

### 3. View in IE

Run `yarn start-fallback` on the host machine. Open Internet Explorer in the your VM (you'll need to search using the Start menu because Edge is the default browser) and navigate to `calypso.localhost:3000`.
