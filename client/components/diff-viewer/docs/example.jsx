import DiffViewer from '../index';

DiffViewer.displayName = 'DiffViewer';

const DiffViewerExample = ( {
	exampleCode = `<DiffViewer diff={ \`diff --git a/circle.yml b/circle.yml
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
\` } />`,
} ) => exampleCode;

DiffViewerExample.displayName = 'DiffViewer';

export default DiffViewerExample;
