import { getUrlParts } from '@automattic/calypso-url';
import { Step } from '@automattic/onboarding';
import { Notice } from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useEffect } from 'react';
import { convertPlatformName } from 'calypso/blocks/import/util';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { isPlatformImportable } from '../import/helper';
import { SitePreview } from '../site-migration-instructions/site-preview';
import successIcon from './success.svg';
import type { Step as StepType } from '../../types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

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
		| { action: 'back' | 'backup_file' }
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
	const query = useQuery();
	const from = query.get( 'from' ) || '';
	const host = query.get( 'host' ) || undefined;
	const platform = query.get( 'platform' );
	const isUnknown = platform === 'unknown';
	const isWpcom = query.get( 'isWpcom' ) === 'true';
	const isImportable =
		!! platform &&
		platform !== 'wordpress' &&
		platform !== 'wix' &&
		isPlatformImportable( platform as ImporterPlatform );
	const showChoices = isUnknown || isWpcom || isImportable;
	const { protocol, hostname } = getUrlParts( from );
	const hasSource =
		!! hostname &&
		( protocol === 'http:' || protocol === 'https:' ) &&
		( platform === 'wordpress' || ( ( isUnknown || isImportable ) && ! isWpcom ) );
	const platformName = convertPlatformName( platform as ImporterPlatform );
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
	} else if ( isUnknown ) {
		title = translate( 'We couldn’t tell what your site runs on' );
		subTitle = translate( 'Some hosts and CDNs hide it. Tell us, and we’ll take it from there.' );
	} else if ( isWpcom ) {
		title = translate( 'Your site is already on WordPress.com' );
		subTitle = translate( 'Let’s figure out your next step together.' );
	} else if ( isImportable ) {
		title = translate( 'Your site is built with %(platform)s', {
			args: { platform: platformName },
		} );
		subTitle = translate(
			'We can bring your content across. The design won’t come with it, so the quickest way to a finished site is with a person.'
		);
	}
	let choices: {
		title: TranslateResult;
		description: TranslateResult;
		action?: 'backup_file';
	}[] = isWpcom
		? [
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
			]
		: [
				{
					title: translate( 'It’s a WordPress site' ),
					description: translate(
						'We’ll connect to it and copy everything, theme, plugins, content.'
					),
				},
				{
					title: translate( 'It’s built on something else' ),
					description: translate(
						'Wix, Squarespace, Blogger, and others, we’ll check what we can bring across.'
					),
				},
				{
					title: translate( 'I have a backup file' ),
					description: translate( 'A .zip or .wpress export. We’ll do the rest.' ),
					action: 'backup_file',
				},
			];
	if ( isImportable ) {
		choices = [
			{
				title: translate( 'Have our team migrate it for you' ),
				description: translate(
					'Included with any plan. A person rebuilds your site on WordPress.com and checks it with you.'
				),
			},
			{
				title: translate( 'Have a designer build you a new site' ),
				description: translate(
					'Built By WordPress.com Express: a designer starts from your content and delivers it in about a week.'
				),
			},
		];
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
	if ( ! showChoices && isLoadingDestination ) {
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
					{ isUnknown ? (
						<span className="site-migration-check__platform">
							{ translate( 'unknown platform' ) }
						</span>
					) : (
						<Step.LinkButton href={ from } target="_blank" rel="noopener noreferrer">
							{ translate( '%(platform)s site ↗', { args: { platform: platformName } } ) }
						</Step.LinkButton>
					) }
				</div>
				{ showChoices ? (
					<div className="site-migration-check__card">
						{ choices.map( ( { title, description, action } ) => (
							<Step.LinkButton
								key={ String( title ) }
								className="site-migration-check__choice"
								disabled={ ! action }
								onClick={ action ? () => navigation.submit?.( { action } ) : undefined }
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
						{ isImportable ? (
							<div className="site-migration-check__actions">
								<Step.PrimaryButton disabled>
									{ translate( 'I just want to import my content' ) }
								</Step.PrimaryButton>
								<Step.SecondaryButton disabled>
									{ translate( 'Have our team do it' ) }
								</Step.SecondaryButton>
							</div>
						) : (
							<Step.LinkButton onClick={ returnToAddress }>
								{ translate( 'Not the site you meant? Enter a different URL' ) }
							</Step.LinkButton>
						) }
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
									disabled={ showUpgrade }
									onClick={ () =>
										navigation.submit?.( {
											action: 'continue',
											from,
											platform: 'wordpress',
											host,
										} )
									}
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
