import { StepContainer, Title, SubTitle, HOSTED_SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { Icon, next, published, shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { type FC, ReactElement, useEffect, useState, useCallback } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { GUIDED_ONBOARDING_FLOW_REFERRER } from 'calypso/signup/steps/initial-intent/constants';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import type { Step } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface HostingDetailsWithIconsProps {
	items: {
		icon: ReactElement;
		description: string;
	}[];
}

const HostingDetailsWithIcons: FC< HostingDetailsWithIconsProps > = ( { items } ) => {
	const translate = useTranslate();

	return (
		<div className="import__site-identify-hosting-details-experiment">
			<p className="import__site-identify-hosting-details-experiment-title">
				{ translate( 'Why should you host with us?' ) }
			</p>
			<ul className="import__site-identify-hosting-details-experiment-list">
				{ items.map( ( item, index ) => (
					<li key={ index } className="import__site-identify-hosting-details-experiment-list-item">
						<Icon
							className="import__site-identify-hosting-details-experiment-icon"
							icon={ item.icon }
							size={ 24 }
						/>
						<p className="import__site-identify-hosting-details-experiment-description">
							{ item.description }
						</p>
					</li>
				) ) }
			</ul>
		</div>
	);
};

interface Props {
	hasError?: boolean;
	onComplete: ( siteInfo: UrlData ) => void;
	onSkip: () => void;
	hideImporterListLink: boolean;
	flowName: string;
}

export const Analyzer: FC< Props > = ( { onComplete, onSkip, hideImporterListLink = false } ) => {
	const translate = useTranslate();
	const [ siteURL, setSiteURL ] = useState< string >( '' );
	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	useEffect( () => {
		if ( siteInfo ) {
			onComplete( siteInfo );
		}
	}, [ onComplete, siteInfo ] );

	if ( isFetching || ( isFetched && ! hasError ) ) {
		return <ScanningStep />;
	}

	const hostingDetailItems = {
		'blazing-fast-speed': {
			icon: next,
			description: translate(
				'Blazing fast speeds with lightning-fast load times for a seamless experience.'
			),
		},
		'unmatched-uptime': {
			icon: published,
			description: translate( 'Unmatched reliability with 99.999% uptime and unmetered traffic.' ),
		},
		security: {
			icon: shield,
			description: translate( 'Round-the-clock security monitoring and DDoS protection.' ),
		},
	};

	return (
		<div className="import__capture-wrapper">
			<div className="import__heading import__heading-center">
				<Title>{ translate( 'Let’s find your site' ) }</Title>
				<SubTitle>
					{ translate(
						"Drop your current site address below to get started. In the next step, we'll measure your site's performance and confirm its eligibility for migration."
					) }
				</SubTitle>
			</div>
			<div className="import__capture-container">
				<CaptureInput
					onInputEnter={ setSiteURL }
					onInputChange={ () => setSiteURL( '' ) }
					hasError={ hasError }
					skipInitialChecking
					onDontHaveSiteAddressClick={ onSkip }
					placeholder={ translate( 'mygreatnewblog.com' ) }
					label={ translate( 'Enter your site address:' ) }
					dontHaveSiteAddressLabel={ translate(
						'Or <button>pick your current platform from a list</button>'
					) }
					hideImporterListLink={ hideImporterListLink }
					nextLabelText={ translate( 'Check my site' ) }
				/>
			</div>
			<HostingDetailsWithIcons items={ Object.values( hostingDetailItems ) } />
		</div>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const SiteMigrationIdentify: Step = function ( { navigation, variantSlug, flow } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { createScreenshots } = useSitePreviewMShotImageHandler();

	const handleSubmit = useCallback(
		async ( action: SiteMigrationIdentifyAction, data?: { platform: string; from: string } ) => {
			// If we have a URL of the source, we send requests to the mShots API to create screenshots
			// early in the flow to avoid long loading times in the migration instructions step.
			// Because mShots API can often take a long time to generate screenshots.
			if ( data?.from ) {
				createScreenshots( data?.from );
			}

			navigation?.submit?.( { action, ...data } );
		},
		[ navigation, siteSlug ]
	);

	const urlQueryParams = useQuery();

	const shouldHideBackButton = () => {
		const ref = urlQueryParams.get( 'ref' ) || '';
		const shouldHideBasedOnRef = [ 'entrepreneur-signup', 'calypso-importer' ].includes( ref );
		const shouldHideBasedOnVariant = [ HOSTED_SITE_MIGRATION_FLOW ].includes( variantSlug || '' );
		const shouldNotHideBasedOnRef = [ GUIDED_ONBOARDING_FLOW_REFERRER ].includes( ref );
		const shouldNotHideIfBackToIsSet = Boolean( urlQueryParams.get( 'back_to' ) );
		return (
			( shouldHideBasedOnRef || shouldHideBasedOnVariant ) &&
			! shouldNotHideBasedOnRef &&
			! shouldNotHideIfBackToIsSet
		);
	};

	return (
		<>
			<DocumentHead title={ translate( 'Import your site content' ) } />
			<StepContainer
				stepName="site-migration-identify"
				flowName="site-migration"
				className="import__onboarding-page"
				hideBack={ shouldHideBackButton() }
				backUrl={ urlQueryParams.get( 'back_to' ) || undefined }
				hideSkip
				hideFormattedHeader
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				isFullLayout
				stepContent={
					<Analyzer
						onComplete={ ( { platform, url } ) =>
							handleSubmit( 'continue', { platform, from: url } )
						}
						hideImporterListLink={ urlQueryParams.get( 'hide_importer_link' ) === 'true' }
						onSkip={ () => {
							handleSubmit( 'skip_platform_identification' );
						} }
						flowName={ flow }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationIdentify;
