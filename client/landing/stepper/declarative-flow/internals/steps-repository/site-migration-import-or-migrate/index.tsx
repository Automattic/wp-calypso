import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Badge, Card } from '@automattic/components';
import { StepContainer, SubTitle, Title } from '@automattic/onboarding';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationImportOrMigrate: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';

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

	const { data: hostingProviderDetails } = useHostingProviderUrlDetails( importSiteQueryParam );
	const hostingProviderName = hostingProviderDetails.name;
	const shouldDisplayHostIdentificationMessage =
		! hostingProviderDetails.is_unknown && ! hostingProviderDetails.is_a8c;

	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const handleClick = ( destination: string ) => {
		if ( destination === 'migrate' && ! canInstallPlugins ) {
			return navigation.submit?.( { destination: 'upgrade' } );
		}

		return navigation.submit?.( { destination } );
	};

	const stepContent = (
		<>
			<Title>{ translate( 'What do you want to do?' ) }</Title>

			{ shouldDisplayHostIdentificationMessage && (
				<SubTitle>
					{
						// translators: %(hostingProviderName)s is the name of a hosting provider (e.g. WP Engine).
						translate( 'Your WordPress site is hosted with %(hostingProviderName)s.', {
							args: { hostingProviderName },
						} )
					}
				</SubTitle>
			) }

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
		</>
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
