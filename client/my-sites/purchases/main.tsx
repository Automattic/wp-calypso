/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { Subscriptions, SiteSubscriptions } from './subscriptions';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSiteUrl from 'state/sites/selectors/get-site-url';

export function Purchases() {
	const translate = useTranslate();

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead title={ translate( 'Billing' ) } />
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing' ) }
				align="left"
			/>

			<Subscriptions />
		</Main>
	);
}

export function SitePurchases() {
	const siteId = useSelector( getSelectedSiteId );
	const translate = useTranslate();

	const siteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );
	const siteHostname = new URL( siteUrl ).hostname; // TODO: use the primary domain here if we can

	return (
		<Main className="purchases is-wide-layout">
			<DocumentHead
				title={ translate( 'Billing for %(siteHostname)s', { args: { siteHostname } } ) }
			/>
			<FormattedHeader
				brandFont
				className="purchases__page-heading"
				headerText={ translate( 'Billing for %(siteHostname)s', { args: { siteHostname } } ) }
				align="left"
			/>

			<SiteSubscriptions siteId={ siteId } />
		</Main>
	);
}
