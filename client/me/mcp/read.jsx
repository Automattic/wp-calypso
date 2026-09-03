import { useTranslate } from 'i18n-calypso';
import { isReadTool } from './categories';
import McpToolsSubpage from './tools-subpage';

export default function McpReadToolsPage( props ) {
	const translate = useTranslate();
	return (
		<McpToolsSubpage
			{ ...props }
			pageViewTitle="MCP Read Access"
			headerTitle={ translate( 'Read' ) }
			filterTool={ isReadTool }
			toolCategory="read"
		/>
	);
}
