/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DiffViewer from '../index';

DiffViewer.displayName = 'DiffViewer';

const DiffViewerExample = ( { exampleCode } ) => exampleCode;

DiffViewerExample.displayName = 'DiffViewer';

DiffViewerExample.defaultProps = {
	exampleCode: `<DiffViewer diff={ \`diff --git a/circle.yml b/circle.yml
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
};

export default DiffViewerExample;
