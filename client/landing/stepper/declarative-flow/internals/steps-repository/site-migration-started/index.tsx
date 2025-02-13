import { ExternalLink } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const recordLinkClick = ( linkname: string ) => {
	recordTracksEvent( 'calypso_site_migration_started_link_click', {
		linkname,
	} );
};

const SiteMigrationStarted: Step = function () {
	const translate = useTranslate();

	const stepContent = (
		<div className="migration-started-card">
			<div className="migration-started-card__illustration">
				<img
					className="migration-started-card__illustration-image"
					src="/calypso/images/importer/migration-started.png"
					alt={ translate( 'An illustration containing a collection of sites.' ) }
				/>
			</div>
			<div className="migration-started-card__content">
				<em className="migration-started-card__pre-title">
					{ translate( 'This might interest you' ) }
				</em>
				<h2 className="migration-started-card__title">
					{ translate( 'Migrating more than one site?' ) }
				</h2>
				<p className="migration-started-card__text">
					{ translate(
						'The new Automattic for agencies will help you manage all the sites in one place to streamline your workload and work smarter.'
					) }
				</p>
				<ExternalLink
					className="migration-started-card__cta"
					href="https://automattic.com/for-agencies/"
					target="_blank"
					onClick={ () => recordLinkClick( 'discover-automattic-for-agencies' ) }
				>
					{ translate( 'Discover Automattic for Agencies' ) }
				</ExternalLink>
			</div>
		</div>
	);

	const sitesDashboardButton = (
		<Button
			className="migration-started__cta"
			href="/sites"
			variant="primary"
			onClick={ () => recordLinkClick( 'view-sites-dashboard' ) }
		>
			{ translate( 'View Sites dashboard' ) }
		</Button>
	);

	return (
		<StepContainer
			stepName="site-migration-started"
			isFullLayout
			formattedHeader={
				<FormattedHeader
					headerText={ translate( 'Migration started' ) }
					subHeaderText={
						<>
							{ translate(
								"Your migration process has started. We'll email you when the process is finished."
							) }
							<br />
							{ translate( 'You can keep track of the progress from your Sites dashboard.' ) }
							<br />
							{ sitesDashboardButton }
						</>
					}
					align="center"
				/>
			}
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationStarted;
