import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import {
	StandAloneComparisonGrid,
	Column,
} from 'calypso/../packages/components/src/standalone-comparison-grid';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

type SubmitDestination = 'import' | 'migrate' | 'upgrade';

const SiteMigrationImportOrMigrate: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const handleSubmit = ( destination: SubmitDestination ) => {
		navigation.submit?.( { destination } );
	};

	const stepContent = (
		<StandAloneComparisonGrid>
			<Column
				title={ translate( 'Import' ) }
				introCopy={ translate( 'Import posts, pages, and media from our supported platforms.' ) }
				features={ [
					translate( 'Import your content from a WordPress export file' ),
					translate( 'Import your content from Blogger' ),
					translate( 'Import your content from Medium' ),
					translate( 'Import your content from Squarespace' ),
					translate( 'Import your content from Substack' ),
					translate( 'Import your content from Wix' ),
					translate( 'Import your content from other platforms' ),
				] }
				controls={
					<Button primary onClick={ () => handleSubmit( 'import' ) }>
						{ translate( 'Import my website content' ) }
					</Button>
				}
			/>
			<Column
				title={ translate( 'Migrate' ) }
				introCopy={ translate(
					'This will copy your existing WordPress site to your new WordPress.com site, including your content, media, plugins, and theme.'
				) }
				features={ [
					translate( 'Import your content' ),
					translate( 'Import your theme' ),
					translate( 'Import your plugins' ),
				] }
				controls={
					<Button
						primary
						onClick={ () => {
							handleSubmit( canInstallPlugins ? 'migrate' : 'upgrade' );
						} }
					>
						{ canInstallPlugins
							? translate( 'Migrate my site' )
							: translate( 'Upgrade to migrate' ) }
					</Button>
				}
			/>
		</StandAloneComparisonGrid>
	);

	return (
		<>
			<StepContainer
				stepName="site-migration-source"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-source"
				hideSkip={ true }
				hideBack={ true }
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationImportOrMigrate;
