import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Badge, Card } from '@automattic/components';
import { StepContainer, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationImportOrMigrate: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const options = [
		{
			label: translate( 'Migrate site' ),
			description: translate(
				"All your site's content, themes, plugins, users and customizations."
			),
			value: 'migrate',
			selected: true,
		},
		{
			label: translate( 'Import content only' ),
			description: translate( 'Import just posts, pages, comments and media.' ),
			value: 'import',
		},
	];

	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const handleClick = ( destination ) => {
		if ( destination === 'migrate' && ! canInstallPlugins ) {
			return navigation.submit?.( { destination: 'upgrade' } );
		}

		return navigation.submit?.( { destination } );
	};

	const stepContent = (
		<div className="import-or-migrate__content">
			<Title className="import-or-migrate__title">{ translate( 'What do you want to do?' ) }</Title>

			<div className="import-or-migrate__list">
				{ options.map( ( option, i ) => (
					<Card
						tagName="button"
						displayAsLink
						key={ i }
						onClick={ () => handleClick( option.value ) }
					>
						<div className="import-or-migrate__header">
							<h2 className="import-or-migrate__name">{ option.label }</h2>

							{ option.value === 'migrate' && (
								<Badge type="info-blue">
									{
										// translators: %(planName)s is a plan name (e.g. Commerce plan).
										translate( 'Requires %(planName)s plan', {
											args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
										} )
									}
								</Badge>
							) }
						</div>

						<p className="import-or-migrate__description">{ option.description }</p>
					</Card>
				) ) }
			</div>
		</div>
	);

	return (
		<>
			<DocumentHead title={ translate( 'What do you want to do?' ) } />
			<StepContainer
				stepName="site-migration-import-or-migrate"
				className="import-or-migrate"
				shouldHideNavButtons={ false }
				hideSkip
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
				goBack={ navigation.goBack }
			/>
		</>
	);
};

export default SiteMigrationImportOrMigrate;
