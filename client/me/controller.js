import page from '@automattic/calypso-router';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import AppsComponent from 'calypso/me/get-apps';
import McpComponent from 'calypso/me/mcp/main';
import McpSetupComponent from 'calypso/me/mcp/setup';
import SidebarComponent from 'calypso/me/sidebar';
import { fetchPreferences } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { hasHostingDashboardOptIn } from 'calypso/state/sites/selectors/has-hosting-dashboard-opt-in';

export function sidebar( context, next ) {
	context.secondary = createElement( SidebarComponent, {
		context: context,
	} );

	next();
}

export function profile( context, next ) {
	const ProfileComponent = require( 'calypso/me/profile' ).default;
	const ProfileTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'My Profile', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<ProfileTitle />
			<ProfileComponent path={ context.path } />
		</>
	);
	next();
}

export function apps( context, next ) {
	const AppsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Get Apps', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<AppsTitle />
			<AppsComponent path={ context.path } />
		</>
	);
	next();
}

export function profileRedirect() {
	page.redirect( '/me' );
}

export function mcp( context, next ) {
	const McpTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'MCP Account Settings', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<McpTitle />
			<QueryUserSettings />
			<McpComponent path={ context.path } />
		</>
	);
	next();
}

export function mcpSetup( context, next ) {
	const McpSetupTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'MCP Setup', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<McpSetupTitle />
			<QueryUserSettings />
			<McpSetupComponent path={ context.path } />
		</>
	);
	next();
}

// Helper thunk that ensures that the user preferences has been fetched into Redux state before we
// continue working with it.
const waitForPrefs = () => async ( dispatch, getState ) => {
	if ( hasReceivedRemotePreferences( getState() ) ) {
		return;
	}

	try {
		await dispatch( fetchPreferences() );
	} catch {
		// if the fetching of preferences fails, return gracefully and proceed to the next landing page candidate
	}
};

// The wp-admin admin bar does not know about user preferences and so may use the
// origin_admin_bar query param to indicate that Calypso should take the user's
// preference into account (without the query param, users can still navigate to
// `/me` or `/me/account` manually, meaning the old dashboard is still accessible
// when the user is specifically trying to go there).
export const maybeRedirectToDashboard = ( context, next ) => {
	const originAdminBar = context.query.origin_admin_bar;
	if ( originAdminBar !== 'wpcom' ) {
		return next();
	}

	const { dispatch, getState } = context.store;

	dispatch( waitForPrefs() ).finally( () => {
		if ( hasHostingDashboardOptIn( getState() ) ) {
			window.location.replace( dashboardLink( '/me/profile' ) );
			return;
		}
		context.page.replace( removeQueryArgs( context.canonicalPath, 'origin_admin_bar' ) );
		next();
	} );
};
