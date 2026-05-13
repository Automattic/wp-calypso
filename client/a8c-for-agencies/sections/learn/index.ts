import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_AI_MCP_AVAILABLE_TOOLS_LINK,
	A4A_AI_MCP_CONNECT_LINK,
	A4A_AI_MCP_LINK,
	A4A_BENCHMARKS_LINK,
	A4A_DEV_TOOLS_LINK,
	A4A_LEARN_LINK,
	A4A_RESOURCES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	aiMcpAvailableToolsContext,
	aiMcpConnectContext,
	aiMcpOverviewContext,
} from '../ai-mcp/controller';
import { benchmarksContext } from '../benchmarks/controller';
import { devToolsContext } from '../dev-tools/controller';
import * as controller from './controller';

export default function () {
	page(
		A4A_LEARN_LINK,
		requireAccessContext,
		controller.learnResourceCenterContext,
		makeLayout,
		clientRender
	);
	page( A4A_DEV_TOOLS_LINK, requireAccessContext, devToolsContext, makeLayout, clientRender );

	if ( isEnabled( 'a4a-benchmarks' ) ) {
		page( A4A_BENCHMARKS_LINK, requireAccessContext, benchmarksContext, makeLayout, clientRender );
	}

	if ( isEnabled( 'a4a-ai-mcp' ) ) {
		page( A4A_AI_MCP_LINK, requireAccessContext, aiMcpOverviewContext, makeLayout, clientRender );
		page(
			A4A_AI_MCP_AVAILABLE_TOOLS_LINK,
			requireAccessContext,
			aiMcpAvailableToolsContext,
			makeLayout,
			clientRender
		);
		page(
			A4A_AI_MCP_CONNECT_LINK,
			requireAccessContext,
			aiMcpConnectContext,
			makeLayout,
			clientRender
		);
	}

	page( A4A_RESOURCES_LINK, () => page.redirect( A4A_LEARN_LINK ) );
}
