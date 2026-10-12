import { getUrlParts } from '@automattic/calypso-url';
import { Step } from '@automattic/onboarding';
import { Notice } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SitePreview } from '../site-migration-instructions/site-preview';
import successIcon from './success.svg';
import type { Step as StepType } from '../../types';

import './style.scss';

const COMPARISON_PREVIEW_OPTIONS = {
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
	};
	submits:
		| { action: 'back' }
		| {
				action: 'continue' | 'select-existing-site';
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
	const hasDestination = ! showChoices && !! destinationSiteSlug;
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
		title = translate( 'Migrate %(site)s here', { args: { site: hostname } } );
	} else if ( isWpcom ) {
		title = translate( 'Your site is already on WordPress.com' );
		subTitle = translate( 'Let’s figure out your next step together.' );
	}
	const choices = [
		{
			title: translate( 'Make a copy of your site' ),
			description: translate( 'Duplicate it to a new site you can work on.' ),
		},
		{
			title: translate( 'Transfer your domain to WordPress.com' ),
			description: translate( 'Bring the registration across too.' ),
		},
		{
			title: translate( 'Get access to your site' ),
			description: translate( 'Get help accessing and managing your site.' ),
		},
	];
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
				<div className="site-migration-check__summary">
					<span>{ hasDestination ? `${ hostname } → ${ destinationSiteSlug }` : hostname }</span>
					<Step.LinkButton href={ from } target="_blank" rel="noopener noreferrer">
						{ translate( 'WordPress site ↗' ) }
					</Step.LinkButton>
				</div>
				{ showChoices ? (
					<div className="site-migration-check__card">
						{ choices.map( ( { title, description } ) => (
							<Step.LinkButton
								key={ String( title ) }
								className="site-migration-check__choice"
								disabled
							>
								<span className="site-migration-check__choice-content">
									<span className="site-migration-check__choice-title">{ title }</span>
									<span className="site-migration-check__choice-description">{ description }</span>
								</span>
								<span className="site-migration-check__choice-arrow" aria-hidden="true">
									›
								</span>
							</Step.LinkButton>
						) ) }
						<Step.LinkButton onClick={ returnToAddress }>
							{ translate( 'Not the site you meant? Enter a different URL' ) }
						</Step.LinkButton>
					</div>
				) : (
					<>
						{ showComparison ? (
							<div className="site-migration-check__comparison">
								<div className="site-migration-check__comparison-site">
									<p className="site-migration-check__preview-label">
										{ translate( '%(site)s today', { args: { site: destinationSiteSlug } } ) }
									</p>
									<SitePreview
										url={ destinationSiteUrl || `https://${ destinationSiteSlug }` }
										label={ translate( 'Current destination site' ) }
										mshotsOptions={ COMPARISON_PREVIEW_OPTIONS }
									/>
									<p className="site-migration-check__preview-description">
										{ translate(
											'Its posts, pages, media, theme, plugins, and settings are replaced.'
										) }
									</p>
								</div>
								<span className="site-migration-check__comparison-arrow" aria-hidden="true">
									→
								</span>
								<div className="site-migration-check__comparison-site">
									<p className="site-migration-check__preview-label">
										{ translate( '%(site)s after the migration', {
											args: { site: destinationSiteSlug },
										} ) }
									</p>
									<SitePreview
										url={ from }
										label={ translate( 'Source site to be copied' ) }
										mshotsOptions={ COMPARISON_PREVIEW_OPTIONS }
									/>
									<p className="site-migration-check__preview-description">
										{ translate(
											'%(site)s’s posts, pages, media, theme, plugins, and settings are copied in.',
											{ args: { site: hostname } }
										) }
									</p>
								</div>
							</div>
						) : (
							<SitePreview />
						) }
						<div className="site-migration-check__card">
							{ showUpgrade && (
								<p className="site-migration-check__upgrade-description">
									{ destinationPlanName
										? translate(
												'%(destination)s is on the %(plan)s plan, which can’t run plugins. Upgrade it, and we prepare its hosting and copy %(source)s into it.',
												{
													args: {
														destination: destinationSiteSlug,
														plan: destinationPlanName,
														source: hostname,
													},
												}
											)
										: translate(
												'%(destination)s can’t run plugins on its current plan. Upgrade it, and we prepare its hosting and copy %(source)s into it.',
												{ args: { destination: destinationSiteSlug, source: hostname } }
											) }
								</p>
							) }
							{ showComparison && (
								<p className="site-migration-check__upgrade-description">
									{ translate( 'Your plan and the site’s address stay the same.' ) }
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
								<Step.LinkButton disabled>
									{ translate( 'Rather have us do it? Talk to a migration expert' ) }
								</Step.LinkButton>
							) }
						</div>
					</>
				) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCheck;
