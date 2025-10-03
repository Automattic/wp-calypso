import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import AppsComponent from 'calypso/me/get-apps';
import McpComponent from 'calypso/me/mcp/main';
import McpSetupComponent from 'calypso/me/mcp/setup';
import SidebarComponent from 'calypso/me/sidebar';

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
