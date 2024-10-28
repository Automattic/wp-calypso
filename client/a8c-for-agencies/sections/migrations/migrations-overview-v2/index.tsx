import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function MigrationsOverviewV2() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Migrations' );

	const onMigrateSitesClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_migrate_sites_button_click' ) );
	}, [ dispatch ] );

	return (
		<Layout className="migrations-overview-v2" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<Button
							variant="primary"
							onClick={ onMigrateSitesClick }
							href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
						>
							{ translate( 'Migrate your sites' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>Migrations Overview V2</LayoutBody>
		</Layout>
	);
}
