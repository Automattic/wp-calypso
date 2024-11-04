import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType8 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function MigrationsCTA() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onMigrateClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_migrations_migrate_sites_button_click' ) );
	};

	return (
		<PageSection
			heading={ translate( 'Let’s get your clients on better hosting' ) }
			description={ translate( 'Ready to make the switch? Let’s get started.' ) }
			background={ BackgroundType8 }
		>
			<Button
				className="migrations-cta__button"
				variant="primary"
				onClick={ onMigrateClick }
				href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
			>
				{ translate( 'Start migrating your sites' ) }
			</Button>
		</PageSection>
	);
}
