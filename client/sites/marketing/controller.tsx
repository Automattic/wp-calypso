import { __ } from '@wordpress/i18n';
import NavigationHeader from 'calypso/components/navigation-header';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
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
	],
} );

export function marketingTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="tools" />
			<div>
				<NavigationHeader
					title={ __( 'Marketing Tools' ) }
					subtitle={ __(
						'Explore tools to build your audience, market your site, and engage your visitors.'
					) }
				/>
				<MarketingTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}
