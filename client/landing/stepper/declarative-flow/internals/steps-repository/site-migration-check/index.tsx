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

const SiteMigrationCheck: StepType< {
	submits:
		| { action: 'back' | 'backup_file' }
		| { action: 'continue'; from: string; platform: 'wordpress'; host?: string };
} > = ( { navigation } ) => {
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
	let title: TranslateResult = translate( 'We can copy your whole site' );
	let subTitle: TranslateResult | undefined;
	if ( isUnknown ) {
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
					<span>{ hostname }</span>
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
						<SitePreview />
						<div className="site-migration-check__card">
							<Notice status="success" isDismissible={ false }>
								<img src={ successIcon } alt="" width={ 24 } height={ 24 } />
								<span>
									{ translate(
										'%(site)s runs on WordPress, so we copy all of it: pages, posts, media, theme, plugins, and settings.',
										{ args: { site: hostname } }
									) }
								</span>
							</Notice>
							<Step.PrimaryButton
								onClick={ () =>
									navigation.submit?.( {
										action: 'continue',
										from,
										platform: 'wordpress',
										host,
									} )
								}
							>
								{ translate( 'Continue' ) }
							</Step.PrimaryButton>
							<Step.LinkButton disabled>
								{ translate( 'Rather have us do it? Talk to a migration expert' ) }
							</Step.LinkButton>
						</div>
					</>
				) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCheck;
