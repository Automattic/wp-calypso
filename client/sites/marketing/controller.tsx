import { __ } from '@wordpress/i18n';
import MarketingBusinessTools from 'calypso/my-sites/marketing/business-tools';
import MarketingSharingButtons from 'calypso/my-sites/marketing/buttons/buttons';
import MarketingConnections from 'calypso/my-sites/marketing/connections/connections';
import MarketingTools from 'calypso/my-sites/marketing/tools';
import MarketingTraffic from 'calypso/my-sites/marketing/traffic';
import makeSidebar, { PanelWithSidebar } from '../components/panel-sidebar';
import type { Context as PageJSContext } from '@automattic/calypso-router';

import 'calypso/my-sites/marketing/style.scss';

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
		{
			key: 'connections',
			get label() {
				return __( 'Connections' );
			},
		},
		{
			key: 'traffic',
			get label() {
				return __( 'Traffic' );
			},
		},
		{
			key: 'sharing-buttons',
			get label() {
				return __( 'Sharing Buttons' );
			},
		},
	],
} );

export function marketingTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="tools" />
			<div>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>
					Marketing Tools
				</h1>
				<MarketingTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function businessTools( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="business-tools" />
			<div>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>
					Business Tools
				</h1>
				<MarketingBusinessTools />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function connections( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="connections" />
			<div style={ { width: '100%' } }>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Connections</h1>
				<MarketingConnections />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function traffic( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="traffic" />
			<div style={ { width: '100%' } }>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>Traffic</h1>
				<MarketingTraffic />
			</div>
		</PanelWithSidebar>
	);
	next();
}

export function sharingButtons( context: PageJSContext, next: () => void ) {
	context.primary = (
		<PanelWithSidebar>
			<MarketingSidebar selectedItemKey="traffic" />
			<div style={ { width: '100%' } }>
				<h1 style={ { fontSize: '20px', fontWeight: 500, marginBottom: '20px' } }>
					Sharing Buttons
				</h1>
				<MarketingSharingButtons />
			</div>
		</PanelWithSidebar>
	);
	next();
}
