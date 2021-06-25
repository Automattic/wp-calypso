# Trailing Whitespace

All source files should have trailing whitespace removed.

It can be easy to leave whitespace at the end of lines by mistake. If you use Sublime Text you can strip this out automatically on save. Go to SublimeText 2 > Preferences > Settings - User (or just hit the Mac Standard cmd + ,). This should open your User Settings as a JSON file. Add the following to your file

```
“trim_trailing_whitespace_on_save”: true
```

If you use Coda2 you can use the Whiteout plugin: <http://erikhinterbichler.com/apps/white-out/>

When touching code that does not have trailing whitespace trimmed, make a separate commit that does the stripping before starting to make changes. This makes it easier to follow changes when looking at the history.
