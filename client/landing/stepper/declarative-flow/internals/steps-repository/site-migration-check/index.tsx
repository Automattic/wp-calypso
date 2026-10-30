import { getUrlParts } from '@automattic/calypso-url';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { Notice } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SitePreview } from '../site-migration-instructions/site-preview';
import successIcon from './success.svg';
import type { Step as StepType } from '../../types';

import './style.scss';

export type CopySiteEligibility = 'eligible' | 'ineligible' | 'loading';

const PREVIEW_OPTIONS = {
	vpw: 1200,
	vph: 800,
	w: 1200,
	h: 800,
	screen_height: 800,
	scale: 2,
};

const SiteMigrationCheck: StepType< {
	accepts: {
		destinationSiteSlug?: string;
		destinationSiteUrl?: string;
		destinationPlanName?: string;
		needsUpgrade?: boolean;
		isLoadingDestination?: boolean;
		destinationFailed?: boolean;
		onRetryDestination?: () => void;
		copySiteEligibility?: CopySiteEligibility;
	};
	submits:
		| { action: 'back' }
		| {
				action:
					| 'continue'
					| 'assisted-migration'
					| 'select-existing-site'
					| 'copy-site'
					| 'transfer-domain'
					| 'get-access';
				from: string;
				platform: 'wordpress';
				host?: string;
		  };
} > = ( {
	navigation,
	destinationSiteSlug,
	destinationSiteUrl,
	destinationPlanName,
	needsUpgrade,
	isLoadingDestination,
	destinationFailed,
	onRetryDestination,
	copySiteEligibility = 'ineligible',
} ) => {
	const translate = useTranslate();
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const query = useQuery();
	const from = query.get( 'from' ) || '';
	const host = query.get( 'host' ) || undefined;
	const platform = query.get( 'platform' );
	const isWpcom = query.get( 'isWpcom' ) === 'true';
	const showChoices = isWpcom;
	const { protocol, hostname } = getUrlParts( from );
	const hasSource =
		!! hostname && ( protocol === 'http:' || protocol === 'https:' ) && platform === 'wordpress';
	const hasDestination = ! showChoices && ( !! destinationSiteSlug || !! destinationFailed );
	const showUpgrade = hasDestination && needsUpgrade;
	const showComparison = hasDestination && ! needsUpgrade;
	let continueLabel = translate( 'Continue' );
	if ( showUpgrade ) {
		continueLabel = translate( 'Upgrade and continue' );
	} else if ( showComparison ) {
		continueLabel = translate( 'Replace and continue' );
	}
	let title: TranslateResult = translate( 'We can copy your whole site' );
	let subTitle: TranslateResult | undefined;
	if ( hasDestination ) {
		title = translate( 'Migrate %(site)s', { args: { site: hostname } } );
	} else if ( isWpcom ) {
		title = translate( 'Your site is already on WordPress.com' );
		subTitle = translate( 'Let’s figure out your next step together.' );
	}
	const choices: {
		action: 'copy-site' | 'transfer-domain' | 'get-access';
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

	const returnToAddress = () => navigation.submit?.( { action: 'back' } );

	useEffect( () => {
		if ( ! hasSource ) {
			navigation.submit?.( { action: 'back' } );
		}
	}, [ hasSource, navigation ] );

	if ( ! hasSource ) {
		return null;
	}
	if ( ! showChoices && ( isLoadingDestination || isSubmitting ) ) {
		return <Step.Loading />;
	}

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				className={
					showChoices
						? 'site-migration-check site-migration-check--choices'
						: 'site-migration-check'
				}
				columnWidth={ 6 }
				topBar={
					<Step.TopBar
						leftElement={ <Step.BackButton onClick={ navigation.goBack ?? returnToAddress } /> }
					/>
				}
				heading={ <Step.Heading text={ title } subText={ subTitle } /> }
			>
				{ ! hasDestination && (
					<div className="site-migration-check__summary">
						<span>{ hostname }</span>
						<Step.LinkButton href={ from } target="_blank" rel="noopener noreferrer">
							{ translate( 'WordPress site ↗' ) }
						</Step.LinkButton>
					</div>
				) }
				{ destinationFailed && (
					<div className="site-migration-check__card">
						<Notice status="error" isDismissible={ false }>
							{ destinationSiteSlug
								? translate( 'We couldn’t load %(site)s.', { args: { site: destinationSiteSlug } } )
								: translate( 'We couldn’t load the destination site.' ) }
						</Notice>
						<div className="site-migration-check__actions">
							<Step.PrimaryButton
								onClick={ () =>
									navigation.submit?.( {
										action: 'select-existing-site',
										from,
										platform: 'wordpress',
										host,
									} )
								}
							>
								{ translate( 'Use a different site' ) }
							</Step.PrimaryButton>
							{ onRetryDestination && (
								<Step.LinkButton onClick={ onRetryDestination }>
									{ translate( 'Try again' ) }
								</Step.LinkButton>
							) }
						</div>
					</div>
				) }
				{ ! destinationFailed &&
					( showChoices ? (
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
										<span className="site-migration-check__choice-description">
											{ description }
										</span>
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
					) : (
						<>
							{ hasDestination ? (
								<div className="site-migration-check__comparison">
									<div className="site-migration-check__comparison-site">
										<div className="site-migration-check__preview-label">
											<span className="site-migration-check__preview-heading">
												{ translate( 'Source' ) }
											</span>
											<a
												className="site-migration-check__preview-address"
												href={ from }
												target="_blank"
												rel="noopener noreferrer"
												title={ hostname }
											>
												<span className="site-migration-check__preview-address-text">
													{ hostname }
												</span>{ ' ' }
												↗
											</a>
										</div>
										<SitePreview
											url={ from }
											label={ translate( 'Source site to be copied' ) }
											mshotsOptions={ PREVIEW_OPTIONS }
										/>
										<p className="site-migration-check__preview-description">
											{ translate(
												'The content on this site will be copied. No changes will be made to the site itself.'
											) }
										</p>
									</div>
									<span className="site-migration-check__comparison-arrow" aria-hidden="true">
										→
									</span>
									<div className="site-migration-check__comparison-site">
										<div className="site-migration-check__preview-label">
											<span className="site-migration-check__preview-heading">
												{ translate( 'Destination' ) }
											</span>
											<a
												className="site-migration-check__preview-address"
												href={ destinationSiteUrl || `https://${ destinationSiteSlug }` }
												target="_blank"
												rel="noopener noreferrer"
												title={ destinationSiteSlug }
											>
												<span className="site-migration-check__preview-address-text">
													{ destinationSiteSlug }
												</span>{ ' ' }
												↗
											</a>
										</div>
										<SitePreview
											url={ destinationSiteUrl || `https://${ destinationSiteSlug }` }
											label={ translate( 'Current destination site' ) }
											mshotsOptions={ PREVIEW_OPTIONS }
										/>
										<p className="site-migration-check__preview-description">
											{ translate( 'All of the content on this site will be replaced.' ) }
										</p>
									</div>
								</div>
							) : (
								<SitePreview mshotsOptions={ PREVIEW_OPTIONS } />
							) }
							<div className="site-migration-check__card">
								{ showUpgrade && (
									<p className="site-migration-check__upgrade-description">
										{ destinationPlanName
											? translate(
													'The destination site is on the %(plan)s plan, which doesn’t support plugins. Upgrade it to continue the migration.',
													{ args: { plan: destinationPlanName } }
												)
											: translate(
													'The destination site’s plan doesn’t support plugins. Upgrade it to continue the migration.'
												) }
									</p>
								) }
								{ showComparison && (
									<p className="site-migration-check__upgrade-description">
										{ translate(
											'The destination site will keep its current domain. Once the migration is finished, we’ll help you switch it to %(source)s when you’re ready.',
											{ args: { source: hostname } }
										) }
									</p>
								) }
								{ ! hasDestination && (
									<Notice status="success" isDismissible={ false }>
										<img src={ successIcon } alt="" width={ 24 } height={ 24 } />
										<span>
											{ translate(
												'%(site)s runs on WordPress, so we copy all of it: pages, posts, media, theme, plugins, and settings.',
												{ args: { site: hostname } }
											) }
										</span>
									</Notice>
								) }
								<div className="site-migration-check__actions">
									<Step.PrimaryButton
										onClick={ () => {
											if ( showComparison ) {
												setIsSubmitting( true );
											}
											navigation.submit?.( {
												action: 'continue',
												from,
												platform: 'wordpress',
												host,
											} );
										} }
									>
										{ continueLabel }
									</Step.PrimaryButton>
									{ showComparison && (
										<Step.LinkButton
											onClick={ () =>
												navigation.submit?.( {
													action: 'select-existing-site',
													from,
													platform: 'wordpress',
													host,
												} )
											}
										>
											{ translate( 'Use a different site' ) }
										</Step.LinkButton>
									) }
								</div>
								{ ! hasDestination && (
									<Step.LinkButton
										onClick={ () =>
											navigation.submit?.( {
												action: 'assisted-migration',
												from,
												platform: 'wordpress',
												host,
											} )
										}
									>
										{ translate( 'Rather have us do it? Talk to a migration expert' ) }
									</Step.LinkButton>
								) }
							</div>
						</>
					) ) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCheck;
