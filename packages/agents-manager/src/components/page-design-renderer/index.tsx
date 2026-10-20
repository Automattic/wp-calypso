/**
 * Hosts the page-design renderer hook on the editor surface, where the data
 * registry is; the counterpart of `editor-history-bridge`.
 */

import { usePageDesignRenderer } from '../../abilities/stream-page-design/renderer';
import { useEditorHost } from '../../abilities/stream-page-design/use-editor-host';

export default function PageDesignRenderer() {
	usePageDesignRenderer( useEditorHost() );

	return null;
}
