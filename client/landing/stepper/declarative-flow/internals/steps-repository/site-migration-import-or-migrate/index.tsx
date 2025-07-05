import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { BadgeType } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { canInstallPlugins } from '@automattic/sites';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useMigrationCancellation } from 'calypso/data/site-migration/landing/use-migration-cancellation';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import FlowCard from '../components/flow-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationImportOrMigrate: StepType< {
	submits: {
		destination: 'migrate' | 'import' | 'upgrade';
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { deleteMigrationSticker } = useMigrationStickerMutation();
	const { mutate: cancelMigration } = useMigrationCancellation( site?.ID );
	const siteCanInstallPlugins = canInstallPlugins( site );
	const isUpgradeRequired = ! siteCanInstallPlugins;

	const options = useMemo( () => {
		const upgradeRequiredLabel = translate( '%(discountPercentage)s off %(planName)s', {
			args: {
				planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
				discountPercentage: formatNumber( 0.5, { numberFormatOptions: { style: 'percent' } } ),
			},
			comment: 'discountPercentage is a number between 0 and 100 followed or preceded by a % sign',
		} );

		const migrateOptionDescription = translate(
			"For WordPress sites. Move all your site's content, themes, plugins, and users to WordPress.com."
		);

		return [
			{
				label: translate( 'Migrate site' ),
				description: migrateOptionDescription,
				value: 'migrate' as const,
				badge: {
					type: 'info-blue' as BadgeType,
					text: isUpgradeRequired ? upgradeRequiredLabel : translate( 'Included with your plan' ),
				},
				selected: true,
			},
			{
				label: translate( 'Import content only' ),
				description: translate( 'Import just posts, pages, comments and media.' ),
				value: 'import' as const,
			},
		];
	}, [ isUpgradeRequired, translate ] );

	const { data: hostingProviderDetails } = useHostingProviderUrlDetails( importSiteQueryParam );
	const hostingProviderName = hostingProviderDetails.name;
	const shouldDisplayHostIdentificationMessage =
		! hostingProviderDetails.is_unknown && ! hostingProviderDetails.is_a8c;

	const handleClick = ( destination: 'migrate' | 'import' | 'upgrade' ) => {
		if ( destination === 'migrate' && ! siteCanInstallPlugins ) {
			return navigation.submit?.( { destination: 'upgrade' } );
		}

		if ( destination === 'import' && site && site.ID ) {
			//TODO: This is a temporary solution to delete the migration sticker and the migration flow.
			// We should refactor this to use a single endpoint to handle both operations.
			deleteMigrationSticker( site.ID );
			cancelMigration();
		}

		return navigation.submit?.( { destination } );
	};

	const stepContent = (
		<>
			<div className="import-or-migrate__list">
				{ options.map( ( option, i ) => (
					<FlowCard
						key={ i }
						title={ option.label }
						badge={ option.badge }
						text={ option.description }
						onClick={ () => handleClick( option.value ) }
					/>
				) ) }
			</div>
		</>
	);

	const pageTitle = translate( 'What do you want to do?' );
	const pageSubTitle = shouldDisplayHostIdentificationMessage
		? translate( 'Your WordPress site is hosted with %(hostingProviderName)s.', {
				args: { hostingProviderName },
		  } )
		: '';

	return (
		<>
			<DocumentHead title={ pageTitle } />
			<Step.CenteredColumnLayout
				columnWidth={ 5 }
				topBar={ <Step.TopBar leftElement={ <Step.BackButton onClick={ navigation.goBack } /> } /> }
				heading={ <Step.Heading text={ pageTitle } subText={ pageSubTitle } /> }
				className="import-or-migrate-v2"
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationImportOrMigrate;
