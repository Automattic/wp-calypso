import { useTranslate } from 'i18n-calypso';
import { isWriteTool } from './categories';
import McpToolsSubpage from './tools-subpage';

export default function McpWriteToolsPage( props ) {
	const translate = useTranslate();
	return (
		<McpToolsSubpage
			{ ...props }
			pageViewTitle="MCP Write Access"
			headerTitle={ translate( 'Write' ) }
			filterTool={ isWriteTool }
			toolCategory="write"
			groupingMode="categories"
		/>
	);
}
