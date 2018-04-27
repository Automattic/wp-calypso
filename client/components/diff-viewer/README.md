Unified Diff Viewer
===

This component renders the output of a unified diff (`git diff` or `diff -u`) in a
visual format recognizable by someone who works with `diff` and comparing files.

## Usage

```jsx
import DiffViewer from 'components/diff-viewer';

export const CommitView = ( { commitHash, description, diff } ) => (
	<div>
		<div><a>{ commitHash }</a></div>
		<p>{ description }</p>
		<DiffViewer diff={ diff } />
	</div>
);
```

### Props

Name | Type | Default | Description
--- | --- | --- | ---
`diff`* | `string` | `''` | Actual text output of the diff

### Additional usage information

The diff output should be the full text produced by the diff command (including newlines).
Internally this component relies on `jsdiff` to parse the output (the patch) and produce
the data structure used to display files, hunks (sections of change in the files), and
the actual lines of change and context.

```
diff --git a/circle.yml b/circle.yml
index 51455bdb14..bc0622d001 100644
--- a/circle.yml
+++ b/circle.yml
@@ -1,6 +1,6 @@
 machine:
   node:
-    version: 8.9.4
+    version: 8.11.0
 test:
   pre:
     - ? |
```

The filenames _may_ be prefixed with a false such as in the example output from `git` above.
This component currently ignores the base path of the file entirely and so does not care
about this prefix. As a result, it also won't show that a file changed names if the filename
itself is the same but the base path changed.
