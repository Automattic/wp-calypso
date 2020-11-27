# New Line at the End of file

In most cases, it is [recommended](https://stackoverflow.com/questions/729692/why-should-text-files-end-with-a-newline) to include a new line at the end of text / source files. [POSIX compliance](http://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_206) is one historical reason, but it also ensures that tools, for example `cat`, return cleanly at the end of their output:

## Not so nice

```
$ cat file-without-newline-at-eol.js
reticulateSplines()
	.then( stopSlackingOff );
commenceLoafing();yourcoolhostname:yourcoolproject yourcoolusername$
```

Your prompt ends up combined with the last line as the end of the source file.

## Better!

```
$ cat file-with-newline-at-eol.js
compileKernel()
	.then( continueBuilding );
waitForIt();
yourcoolhostname:yourcoolproject yourcoolusername$
```

Your prompt stands alone on a new line.

## Tools

- The wpcalypso eslint config [deems](https://github.com/Automattic/eslint-config-wpcalypso/blob/ff0a4e6120113c40cd432d19350497d7612fde97/index.js#L26) it an error if files do not ["end with a newline (LF)"](https://eslint.org/docs/rules/eol-last)
- Prettier reformats files to add a newline at the end ["by design"](https://github.com/prettier/prettier/issues/55#issuecomment-301301268)
- Most (if not all) major editors have settings to add newlines at the end of source files. For example:
  - nano: enabled by default. To disable, you supply the `-L` flag
  - Atom: enabled by default. To disable, you override settings for the core package, [`whitespace`](https://github.com/atom/whitespace)
