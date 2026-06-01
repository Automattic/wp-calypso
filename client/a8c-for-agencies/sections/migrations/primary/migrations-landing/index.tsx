import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import {
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchTaggedSitesForMigration from '../../hooks/use-fetch-tagged-sites-for-migration';

const MigrationsLanding = () => {
	const translate = useTranslate();
	const title = translate( 'Migrations' );

	const { data: taggedSites, isFetched } = useFetchTaggedSitesForMigration();

	useEffect( () => {
		if ( ! isFetched ) {
			return;
		}
		if ( taggedSites?.length ) {
			page.redirect( A4A_MIGRATIONS_COMMISSIONS_LINK );
			return;
		}
		page.redirect( A4A_MIGRATIONS_OVERVIEW_LINK );
	}, [ taggedSites, isFetched ] );

	return <PagePlaceholder title={ title } />;
};

export default MigrationsLanding;
