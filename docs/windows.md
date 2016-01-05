# Installing Calypso on Windows

The set up for Windows is a bit more complicated than if you were on a \*nix system. This is because Node.js does not build anymore under Cygwin or MinGW and as such we are stuck with the Windows build which uses Windows-style paths (`C:\Windows\system`), while most of the utilities we use use Unix style paths (`/home/stuff/here`) and they don't play well together. For this reason it's very important to follow the installation steps carefully, so that correct versions of the needed utilities are installed.

1. **_When installing any of the following tools, it's best not to use directories with spaces in them._**
2. Install [Git for Windows](https://git-scm.com/download/win). Make sure to check `Use Git from the Windows Command Prompt` and select a path without spaces during installation!
3. Install [Node.js](https://nodejs.org/en/download/) through the normal Windows installer.
4. Install [MSYS2](https://msys2.github.io/).
5. Make sure to follow the installation instructions for MSYS2 and update:

    ```
    pacman --needed -Sy bash pacman pacman-mirrors msys2-runtime
    # restart MSYS2
    pacman -Su
    ```
6. For the following commands and generally for working with Calypso, use the `MSYS2 Shell` that's been added to your `Start` menu.
7. Install `make`:

    ```
    pacman -S make
    ```
8. Make sure that `git` is available and the Windows version is used (do *not* install `git` from MSYS2). Also, double check that the reported path does not contain spaces (see step 2).

    ```
    which git
	/c/Git/cmd/git
    ```
9. Install `semver` globally:

    ```
    npm install semver -g
    ```
10. And you're done - you can follow [the normal instructions](https://github.com/Automattic/wp-calypso/blob/master/docs/install.md#installing-and-running) from now on!

Please note that native addons via `node-gyp` are [problematic on Windows](https://github.com/nodejs/node-gyp/issues/629), and on MSYS [even more so](https://github.com/nodejs/node-gyp/issues/740). However, this should only impact the performance of the modules, not the functionality.
