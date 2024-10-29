import { Button, Card } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { BackgroundType5 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import MigrationIcon from 'calypso/assets/images/a8c-for-agencies/migration-icon.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function MigrationsBanner() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onMigrateSiteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a8c_migration_banner_migrate_site_click' ) );
	};

	return (
		<PageSection
			heading={ translate(
				'Migrate your client sites to superior WordPress{{br/}}hosting with Automattic',
				{
					components: {
						br: <br />,
					},
				}
			) }
			background={ BackgroundType5 }
		>
			<Card className="migrations-banner">
				<div className="migrations-banner__main">
					<h2 className="migrations-banner__title">
						<img className="migrations-banner__icon" src={ MigrationIcon } alt="" />
						{ translate(
							'Limited time offer: Migrate your sites to Pressable or WordPress.com and earn up to $10,000!'
						) }
					</h2>

					<div className="migration-banner__content">
						<SimpleList
							items={ [
								translate(
									'{{b}}WP Engine customers:{{/b}} You will receive $100 per site, up to $10,000. You will also get credited for the remaining time on your WP Engine contract, so you won’t have to pay twice.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}For any other host:{{/b}} will receive $100 per site migrated up to a maximum of $3,000.',
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>

						<Button
							className="migrations-banner__cta-button"
							variant="secondary"
							onClick={ onMigrateSiteClick }
							href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
						>
							{ translate( 'Migrate your sites' ) }
						</Button>
					</div>
				</div>
			</Card>
		</PageSection>
	);
}
