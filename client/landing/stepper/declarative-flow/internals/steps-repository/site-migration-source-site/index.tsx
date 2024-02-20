import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

type SubmitDestination = 'import' | 'migrate' | 'upgrade';

const SiteMigrationSource: Step = function ( { navigation } ) {
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
		<div className="migration-info">
			<div className="migration-info-column">
				<h2>{ translate( 'Import' ) }</h2>
				<Button primary onClick={ () => handleSubmit( 'import' ) }>
					{ translate( 'Import my website content' ) }
				</Button>
			</div>
			<div className="migration-info-column">
				<h2>{ translate( 'Migrate' ) }</h2>
				<Button
					primary
					onClick={ () => {
						handleSubmit( canInstallPlugins ? 'migrate' : 'upgrade' );
					} }
				>
					{ canInstallPlugins ? translate( 'Migrate my site' ) : translate( 'Upgrade to migrate' ) }
				</Button>
			</div>
		</div>
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

export default SiteMigrationSource;
