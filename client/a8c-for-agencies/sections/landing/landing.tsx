import page from '@automattic/calypso-router';
import { Spinner } from '@wordpress/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import {
	A4A_OVERVIEW_LINK,
	A4A_SIGNUP_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useSelector } from 'calypso/state';
import { getActiveAgency, hasFetchedAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function Landing() {
	const translate = useTranslate();
	const title = translate( 'Automattic for Agencies' );

	const hasFetched = useSelector( hasFetchedAgency );
	const agency = useSelector( getActiveAgency );

	useEffect( () => {
		if ( ! hasFetched ) {
			return;
		}

		if ( agency ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;

			if ( returnQuery ) {
				page.redirect( returnQuery );
			}

			page.redirect( A4A_OVERVIEW_LINK );
		}

		page.redirect( A4A_SIGNUP_LINK );
	}, [ agency, hasFetched ] );

	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<Spinner />
			</LayoutBody>
		</Layout>
	);
}
