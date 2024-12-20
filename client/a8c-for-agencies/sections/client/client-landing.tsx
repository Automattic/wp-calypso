import page from '@automattic/calypso-router';
import { addQueryArgs, getQueryArg, getQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import {
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { useSelector } from 'calypso/state';
import { hasAgency, hasFetchedAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

/**
 * Redirect with Current Query
 * Adds all of the current location's query parameters to the provided URL before redirecting.
 */
const redirectWithCurrentQuery = ( url: string ) => {
	const args = getQueryArgs( window.location.href );
	return page.redirect( addQueryArgs( url, args ) );
};

export default function ClientLanding() {
	const translate = useTranslate();
	const title = translate( 'Automattic for Agencies' );

	const hasFetchedAgencies = useSelector( hasFetchedAgency );
	const isAgency = useSelector( hasAgency );

	useEffect( () => {
		if ( ! hasFetchedAgencies ) {
			return;
		}

		if ( isAgency ) {
			page.redirect( A4A_OVERVIEW_LINK );
			return;
		}
		const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
		if ( returnQuery ) {
			page.redirect( returnQuery );
			return;
		}
		return redirectWithCurrentQuery( A4A_CLIENT_SUBSCRIPTIONS_LINK );
	}, [ hasFetchedAgencies, isAgency ] );

	return (
		<Layout className="a4a-landing" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>
						<div className="a4a-landing__title-placeholder"></div>
					</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="a4a-landing__section-placeholder">
					<div className="a4a-landing__section-placeholder-title"></div>
					<div className="a4a-landing__section-placeholder-body"></div>
					<div className="a4a-landing__section-placeholder-footer"></div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
