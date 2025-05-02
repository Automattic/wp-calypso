import { formatNumber } from '@automattic/number-formatters';
import { StepContainer, Title, SubTitle, Step } from '@automattic/onboarding';
import { Icon, next, published, shield } from '@wordpress/icons';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { type FC, ReactElement, useEffect, useState, useCallback } from 'react';
import CaptureInput from 'calypso/blocks/import/capture/capture-input';
import ScanningStep from 'calypso/blocks/import/scanning';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { shouldUseStepContainerV2MigrationFlow } from '../../../helpers/should-use-step-container-v2';
//TODO: Move it to a more generic folder
import { useFlowState } from '../../state-manager/store';
import { useSitePreviewMShotImageHandler } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';
import type { Step as StepType } from '../../types';
import type { UrlData } from 'calypso/blocks/import/types';

import './style.scss';

interface HostingDetailsWithIconsProps {
	items: {
		icon: ReactElement;
		description: TranslateResult;
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
	onVisibilityChange: ( isVisible: boolean ) => void;
}

export const Analyzer: FC< Props > = ( {
	onComplete,
	onSkip,
	onVisibilityChange,
	hideImporterListLink = false,
} ) => {
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
		onVisibilityChange?.( false );
		return <ScanningStep />;
	}

	onVisibilityChange?.( true );

	const hostingDetailItems = {
		'blazing-fast-speed': {
			icon: next,
			description: translate(
				'Blazing fast speeds with lightning-fast load times for a seamless experience.'
			),
		},
		'unmatched-uptime': {
			icon: published,
			description: translate(
				'Unmatched reliability with %(uptimePercent)s uptime and unmetered traffic.',
				{
					args: {
						uptimePercent: formatNumber( 0.99999, {
							numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
						} ),
					},
					comment: '99.999% uptime',
				}
			),
		},
		security: {
			icon: shield,
			description: translate( 'Round-the-clock security monitoring and DDoS protection.' ),
		},
	};

	return (
		<>
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
		</>
	);
};

export type SiteMigrationIdentifyAction = 'continue' | 'skip_platform_identification';

const SiteMigrationIdentify: StepType< {
	submits:
		| {
				action: SiteMigrationIdentifyAction;
				platform?: string;
				from?: string;
		  }
		| undefined;
} > = function ( { navigation, flow } ) {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { createScreenshots } = useSitePreviewMShotImageHandler();
	const isUsingStepContainerV2 = shouldUseStepContainerV2MigrationFlow( flow );

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
	const { get } = useFlowState();

	const shouldShowBackButton = () => {
		const ref = get( 'flow' )?.entryPoint;

		const isBackButtonSupported = ref && [ 'goals', 'wp-admin-importers-list' ].includes( ref );
		return isBackButtonSupported || urlQueryParams.has( 'back_to' );
	};

	const getBackButton = () => {
		if ( ! shouldShowBackButton() ) {
			return null;
		}

		const backToUrl = urlQueryParams.get( 'back_to' );
		return backToUrl ? (
			<Step.BackButton href={ backToUrl ?? '' } />
		) : (
			<Step.BackButton onClick={ navigation?.goBack } />
		);
	};

	const [ isVisible, setIsVisible ] = useState( false );

	const stepContent = (
		<Analyzer
			onComplete={ ( { platform, url } ) => handleSubmit( 'continue', { platform, from: url } ) }
			hideImporterListLink={ urlQueryParams.get( 'hide_importer_link' ) === 'true' }
			onSkip={ () => {
				handleSubmit( 'skip_platform_identification' );
			} }
			flowName={ flow }
			onVisibilityChange={ ( isVisible ) => {
				setIsVisible( isVisible );
			} }
		/>
	);

	if ( isUsingStepContainerV2 ) {
		const backButton = getBackButton();
		return (
			<>
				<DocumentHead title={ translate( 'Import your site content' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--site-migration-identify"
					columnWidth={ 4 }
					topBar={ <Step.TopBar leftElement={ backButton } /> }
					heading={
						isVisible ? (
							<Step.Heading
								text={ translate( 'Let’s find your site' ) }
								subText={ translate( 'Enter your current site address below to get started.' ) }
							/>
						) : undefined
					}
				>
					{ stepContent }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Import your site content' ) } />
			<StepContainer
				stepName="site-migration-identify"
				flowName="site-migration"
				className="import__onboarding-page"
				hideBack={ ! shouldShowBackButton() }
				backUrl={ urlQueryParams.get( 'back_to' ) || undefined }
				hideFormattedHeader
				goBack={ navigation?.goBack }
				isFullLayout
				stepContent={
					<div className="import__capture-wrapper">
						{ isVisible && (
							<div className="import__heading import__heading-center">
								<Title>{ translate( 'Let’s find your site' ) }</Title>
								<SubTitle>
									{ translate( 'Enter your current site address below to get started.' ) }
								</SubTitle>
							</div>
						) }
						{ stepContent }
					</div>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationIdentify;
