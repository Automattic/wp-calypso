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
import wpcom from 'calypso/lib/wp';
import { GUIDED_ONBOARDING_FLOW_REFERRER } from 'calypso/signup/steps/initial-intent/constants';
import { useMigrationExperiment } from '../../hooks/use-migration-experiment';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import type { Step } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface HostingDetailsProps {
	items: { title: string; description: string }[];
}

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

const HostingDetails: FC< HostingDetailsProps > = ( { items } ) => {
	const translate = useTranslate();

	return (
		<div className="import__site-identify-hosting-details">
			<p className="import__site-identify-hosting-details--title">
				{ translate( 'Why should you host with us?' ) }
			</p>
			<div className="import__site-identify-hosting-details--list">
				{ items.map( ( item, index ) => (
					<div key={ index } className="import__site-identify-hosting-details--list-item">
						<p className="import__site-identify-hosting-details--list-item-title">{ item.title }</p>
						<p className="import__site-identify-hosting-details--list-item-description">
							{ item.description }
						</p>
					</div>
				) ) }
			</div>
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

export const Analyzer: FC< Props > = ( {
	onComplete,
	onSkip,
	hideImporterListLink = false,
	flowName,
} ) => {
	const translate = useTranslate();
	const [ siteURL, setSiteURL ] = useState< string >( '' );
	const {
		data: siteInfo,
		isError: hasError,
		isFetching,
		isFetched,
	} = useAnalyzeUrlQuery( siteURL, siteURL !== '' );

	const isMigrationExperimentEnabled = useMigrationExperiment( flowName );

	useEffect( () => {
		if ( siteInfo ) {
			onComplete( siteInfo );
		}
	}, [ onComplete, siteInfo ] );

	if ( isFetching || ( isFetched && ! hasError ) ) {
		return <ScanningStep />;
	}

	let hostingDetailItems;

	if ( isMigrationExperimentEnabled ) {
		hostingDetailItems = {
			'blazing-fast-speed': {
				icon: next,
				description: translate(
					'Blazing fast speeds with lightning-fast load times for a seamless experience.'
				),
			},
			'unmatched-uptime': {
				icon: published,
				description: translate(
					'Unmatched reliability with 99.999% uptime and unmetered traffic.'
				),
			},
			security: {
				icon: shield,
				description: translate( 'Round-the-clock security monitoring and DDoS protection.' ),
			},
		};
	} else {
		hostingDetailItems = {
			'unmatched-uptime': {
				title: translate( 'Unmatched Reliability and Uptime' ),
				description: translate(
					"Our infrastructure's 99.99% uptime, combined with our automatic update system, ensures your site remains accessible and secure."
				),
			},
			'effortless-customization': {
				title: translate( 'Effortless Customization' ),
				description: translate(
					'Our tools and options let you easily design a website to meet your needs, whether you’re a beginner or an expert.'
				),
			},
			'blazing-fast-speed': {
				title: translate( 'Blazing Fast Page Speed' ),
				description: translate(
					'Our global CDN with 28+ locations delivers lightning-fast load times for a seamless visitor experience.'
				),
			},
		};
	}

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
			{ isMigrationExperimentEnabled ? (
				<HostingDetailsWithIcons items={ Object.values( hostingDetailItems ) } />
			) : (
				<HostingDetails items={ Object.values( hostingDetailItems ) } />
			) }
		</div>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const saveSiteSettings = async ( siteSlug: string, settings: Record< string, unknown > ) => {
	return wpcom.req.post(
		`/sites/${ siteSlug }/settings`,
		{
			apiVersion: '1.4',
		},
		{
			...settings,
		}
	);
};

const SiteMigrationIdentify: Step = function ( { navigation, variantSlug, flow } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { createScreenshots } = useSitePreviewMShotImageHandler();

	const handleSubmit = useCallback(
		async ( action: SiteMigrationIdentifyAction, data?: { platform: string; from: string } ) => {
			// If we have a site and URL, and we're coming from a WordPress site,
			// record the migration source domain.
			if ( siteSlug && 'wordpress' === data?.platform && data?.from ) {
				await saveSiteSettings( siteSlug, { migration_source_site_domain: data.from } );
			}

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
