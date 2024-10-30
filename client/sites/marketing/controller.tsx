import { __ } from '@wordpress/i18n';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

const MarketingSidebar = makeSidebar( {
	items: [
		{
			key: 'tools',
			get label() {
				return __( 'Marketing Tools' );
			},
		},
		{
			key: 'business-tools',
			get label() {
				return __( 'Business Tools' );
			},
		},
	],
} );

export function marketingTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="tools" />
			<div>This is Marketing Tools page</div>
		</PanelWithSidebar>
	);
	next();
}

export function businessTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="business-tools" />
			<div>This is Business Tools page</div>
		</PanelWithSidebar>
	);
	next();
}
