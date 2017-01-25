# Installing Calypso on Windows

The set up for Windows is a bit more complicated than if you were on a \*nix system. This is because Node.js does not build under Cygwin or MinGW anymore, so we are stuck with the Windows build which uses Windows-style paths (`C:\Windows\system`), while most of our build utilities use Unix style paths (`/home/stuff/here`) and they don't play well together.

> You can use a [portable development environment](https://github.com/Automattic/wp-calypso-bootstrap) to avoid going through all of the following: it will setup a virtual machine with Calypso ready to run for you.

This is a complicated configuration and it's important to follow all instructions and settings in the guide. In particular, when installing any of the following tools, be sure to use paths that do not have spaces in them.

1. Install [Git for Windows](https://git-scm.com/download/win). Make the following changes to the default settings:
   - Install to a path without spaces<br>
     <img width="450" src="https://cloud.githubusercontent.com/assets/227022/12865564/5094f920-cc75-11e5-9230-67c17fbaaa69.png">
   - Select "Use Git from the Windows Command Prompt"<br>
     <img width="450" src="https://cloud.githubusercontent.com/assets/227022/12865563/509471ee-cc75-11e5-91ac-68496802029f.png">

2. Install [Node.js](https://nodejs.org/en/download/) through the normal Windows installer. Make the following changes to the default settings:
   - Install to a path without spaces<br>
     <img width="450" src="https://cloud.githubusercontent.com/assets/227022/12865565/50953368-cc75-11e5-9b77-5ecd78f1d005.png">

3. Install [MSYS2](https://msys2.github.io/).  The default settings are fine.

4. For the following commands and generally for working with Calypso, use the `MSYS2 Shell` that's been added to your `Start` menu.

5. Make sure to follow the installation instructions for MSYS2 and update:
    ```
    pacman --needed -Sy bash pacman pacman-mirrors msys2-runtime
    # restart MSYS2
    pacman -Su
    ```

6. Install `make`:
    ```
    pacman -S make
    ```

7. Make sure that `git` is available and the Windows version is used (do *not* install `git` from MSYS2).  Also, double check that the reported path does not contain spaces.
    ```
    which git
	/c/git/cmd/git
    ```

8. And you're done - you can follow [the normal instructions](https://github.com/Automattic/wp-calypso/blob/master/docs/install.md#installing-and-running) from now on!

The development setup for Calypso uses [`socket.io`](https://github.com/socketio/socket.io), which has some native dependencies.  These are *optional*, but because native addons via `node-gyp` are problematic on both Windows and MSYS (see `node-gyp` [#629](https://github.com/nodejs/node-gyp/issues/629), [#740](https://github.com/nodejs/node-gyp/issues/740)), you may see some errors as they try to build.  As long as they are all related to warning messages like the following:

```
npm WARN optional dep failed, continuing bufferutil@1.2.1
npm WARN optional dep failed, continuing fsevents@1.0.6
npm WARN optional dep failed, continuing utf-8-validate@1.2.1
```

Then this should only affect the performance of the `socket.io` library, not its functionality.
