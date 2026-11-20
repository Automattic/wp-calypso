import { getUrlParts } from '@automattic/calypso-url';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { isSiteAddress } from 'calypso/landing/stepper/utils/site-address';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isSourceUnreachable } from '../site-migration-identify/is-source-unreachable';
import { SiteMigrationConfirm, type SourceIssue } from './confirm';
import type { Step as StepType } from '../../types';

import './style.scss';

export type CopySiteEligibility = 'eligible' | 'ineligible' | 'loading';

const SiteMigrationCheck: StepType< {
	accepts: {
		destinationSiteSlug?: string;
		destinationSiteUrl?: string;
		destinationSiteUrls?: string[];
		needsUpgrade?: boolean;
		isLoadingDestination?: boolean;
		destinationFailed?: boolean;
		onRetryDestination?: () => void;
		copySiteEligibility?: CopySiteEligibility;
		canUseAsDestination?: boolean;
		canPickDestination?: boolean;
	};
	submits:
		| { action: 'back' }
		| {
				action:
					| 'continue'
					| 'select-existing-site'
					| 'copy-site'
					| 'transfer-domain'
					| 'get-access'
					| 'use-as-destination';
				from: string;
				platform: 'wordpress';
				host?: string;
		  };
} > = ( {
	navigation,
	destinationSiteSlug,
	destinationSiteUrl,
	destinationSiteUrls = [],
	needsUpgrade,
	isLoadingDestination,
	destinationFailed,
	onRetryDestination,
	copySiteEligibility = 'ineligible',
	canUseAsDestination = false,
	canPickDestination = true,
} ) => {
	const translate = useTranslate();
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const query = useQuery();
	const from = query.get( 'from' ) || '';
	const host = query.get( 'host' ) || undefined;
	const platform = query.get( 'platform' );
	const showChoices = query.get( 'isWpcom' ) === 'true';
	const { protocol, hostname } = getUrlParts( from );
	const hasSource =
		!! hostname && ( protocol === 'http:' || protocol === 'https:' ) && platform === 'wordpress';
	const hasDestination = ! showChoices && ( !! destinationSiteSlug || !! destinationFailed );
	const isSameSite = hasDestination && isSiteAddress( from, destinationSiteUrls );
	// The address step lets a source picked as WordPress through whatever the analyzer found, so
	// say so here. Detected WordPress sources have already passed these checks.
	const isManualWordPress = query.get( 'manualPlatform' ) === 'wordpress';
	const {
		data: sourceInfo,
		error: sourceError,
		isLoading: isCheckingSource,
	} = useAnalyzeUrlQuery(
		from,
		hasSource && ! showChoices && isManualWordPress,
		// Seeded by the address step, and only read on arrival, so it doesn't go stale on a remount.
		Infinity
	);
	let sourceIssue: SourceIssue | undefined;
	if ( isManualWordPress && ( sourceInfo || sourceError ) ) {
		if ( isSourceUnreachable( sourceInfo, sourceError ) ) {
			sourceIssue = { type: 'unreachable' };
		} else if ( sourceInfo?.platform !== 'wordpress' ) {
			sourceIssue = {
				type: 'unconfirmed',
				platformName:
					sourceInfo && sourceInfo.platform !== 'unknown'
						? convertPlatformName( sourceInfo.platform )
						: undefined,
			};
		}
	}
	// A paid destination is set up on Continue, then the flow leaves for the dashboard.
	const configuresOnContinue = hasDestination && ! needsUpgrade && ! isSameSite;

	const returnToAddress = () => navigation.submit?.( { action: 'back' } );

	useEffect( () => {
		if ( ! hasSource ) {
			navigation.submit?.( { action: 'back' } );
		}
	}, [ hasSource, navigation ] );

	if ( ! hasSource ) {
		return null;
	}
	// Wait for the source checks too, so the page doesn't change under the customer when they land.
	if ( ! showChoices && ( isLoadingDestination || isSubmitting || isCheckingSource ) ) {
		return <Step.Loading />;
	}

	const topBar = (
		<Step.TopBar
			leftElement={ <Step.BackButton onClick={ navigation.goBack ?? returnToAddress } /> }
		/>
	);

	if ( ! showChoices ) {
		return (
			<SiteMigrationConfirm
				topBar={ topBar }
				from={ from }
				hostname={ hostname }
				destinationSiteSlug={ destinationSiteSlug }
				destinationSiteUrl={ destinationSiteUrl }
				destinationFailed={ destinationFailed }
				isSameSite={ isSameSite }
				// Signed out with nothing to fix, Back is enough; a warning keeps it close at hand.
				onChangeSource={ isLoggedIn || sourceIssue ? returnToAddress : undefined }
				onChangeDestination={
					canPickDestination
						? () =>
								navigation.submit?.( {
									action: 'select-existing-site',
									from,
									platform: 'wordpress',
									host,
								} )
						: undefined
				}
				onContinue={ () => {
					if ( configuresOnContinue ) {
						setIsSubmitting( true );
					}
					navigation.submit?.( { action: 'continue', from, platform: 'wordpress', host } );
				} }
				onRetryDestination={ onRetryDestination }
				sourceIssue={ sourceIssue }
			/>
		);
	}

	const title = translate( 'This site is already on WordPress.com' );
	const choices: {
		action: 'copy-site' | 'transfer-domain' | 'get-access' | 'use-as-destination';
		title: TranslateResult;
		description: TranslateResult;
		disabled?: boolean;
		href?: string;
		ineligible?: boolean;
	}[] = [
		{
			action: 'transfer-domain',
			title: translate( 'Transfer your domain to WordPress.com' ),
			description: translate( 'Bring the registration across too.' ),
		},
		{
			action: 'get-access',
			title: translate( 'Get access to your site' ),
			description: translate( 'Get help accessing and managing your site.' ),
		},
	];

	if ( canUseAsDestination ) {
		choices.unshift( {
			action: 'use-as-destination',
			title: __( 'Move your external site here' ),
			description: __( 'Choose the site you want to migrate into this WordPress.com site.' ),
		} );
	}

	if ( copySiteEligibility === 'ineligible' ) {
		choices.push( {
			action: 'copy-site',
			title: translate( 'Make a copy of your site' ),
			description: translate(
				'This site isn’t eligible to be copied. {{learnMore}}Learn more{{/learnMore}}',
				{
					components: {
						learnMore: <span className="site-migration-check__choice-learn-more" />,
					},
				}
			),
			href: localizeUrl( 'https://wordpress.com/support/copy-a-site/' ),
			ineligible: true,
		} );
	} else {
		const isCheckingCopySite = copySiteEligibility === 'loading';
		choices.push( {
			action: 'copy-site',
			title: translate( 'Make a copy of your site' ),
			description: isCheckingCopySite
				? translate( 'Checking if your site can be copied…' )
				: translate( 'Duplicate it to a new site you can work on.' ),
			disabled: isCheckingCopySite,
		} );
	}

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				className="site-migration-check site-migration-check--choices"
				columnWidth={ 6 }
				topBar={ topBar }
				heading={
					<Step.Heading
						text={ title }
						subText={ translate( 'Let’s figure out your next step together.' ) }
					/>
				}
			>
				<div className="site-migration-check__summary">
					<span>{ hostname }</span>
					<Step.LinkButton href={ from } target="_blank" rel="noopener noreferrer">
						{ translate( 'WordPress site ↗' ) }
					</Step.LinkButton>
				</div>
				<div className="site-migration-check__card">
					{ choices.map( ( { action, title, description, disabled, href, ineligible } ) => (
						<Step.LinkButton
							key={ action }
							className={ clsx( 'site-migration-check__choice', {
								'site-migration-check__choice--ineligible': ineligible,
							} ) }
							disabled={ disabled }
							href={ href }
							target={ href ? '_blank' : undefined }
							onClick={
								href
									? undefined
									: () => navigation.submit?.( { action, from, platform: 'wordpress', host } )
							}
						>
							<span className="site-migration-check__choice-content">
								<span className="site-migration-check__choice-title">{ title }</span>
								<span className="site-migration-check__choice-description">{ description }</span>
							</span>
							<span
								className={ clsx( 'site-migration-check__choice-arrow', {
									'site-migration-check__choice-arrow--external': href,
								} ) }
								aria-hidden="true"
							>
								{ href ? '↗' : '›' }
							</span>
						</Step.LinkButton>
					) ) }
					<Step.LinkButton onClick={ returnToAddress }>
						{ translate( 'Not the site you meant? Enter a different URL' ) }
					</Step.LinkButton>
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCheck;
