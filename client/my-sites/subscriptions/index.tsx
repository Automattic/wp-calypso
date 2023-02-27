import config from '@automattic/calypso-config';
import page, { Callback } from 'page';
import { createElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { makeLayout, render } from 'calypso/controller';

const Subscriptions = () => {
	return (
		<Main className="site-settings">
			<DocumentHead title="Subscriptions" />
			<FormattedHeader brandFont headerText="Subscriptions" align="left" />
		</Main>
	);
};

const createSubscriptions: Callback = ( context, next ) => {
	context.primary = createElement( Subscriptions );
	next();
};

const checkFeatureFlag: Callback = ( context, next ) => {
	if ( ! config.isEnabled( 'subscription-management' ) ) {
		next();
	}
	page.redirect( '/' );
};

export default function () {
	page( '/subscriptions', checkFeatureFlag, createSubscriptions, makeLayout, render );
}
