import { __ } from '@wordpress/i18n';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import BusinessTools from './business-tools';
import MarketingTools from './tools';
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
			<MarketingTools />
		</PanelWithSidebar>
	);
	next();
}

export function businessTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="business-tools" />
			<BusinessTools />
		</PanelWithSidebar>
	);
	next();
}
