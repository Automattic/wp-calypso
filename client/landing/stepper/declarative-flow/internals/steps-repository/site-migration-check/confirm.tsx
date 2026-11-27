import { Step } from '@automattic/onboarding';
import { arrowDown, check, Icon } from '@wordpress/icons';
import { Notice } from '@wordpress/ui';
import clsx from 'clsx';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { Fragment, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import {
	SitePreviewPanel,
	SiteWindow,
} from 'calypso/landing/stepper/declarative-flow/internals/components/site-preview-panel';

import './confirm.scss';

/**
 * Why we can't be sure the source, picked as WordPress, is a WordPress site we can copy.
 */
export type SourceIssue =
	| { type: 'unreachable' }
	| {
			type: 'unconfirmed';
			/** The platform the analyzer saw instead, when it recognized one. */
			platformName?: string;
	  };

/**
 * Lets a long address wrap before its dots instead of mid-word.
 */
const wrappableAddress = ( address: string ) =>
	address.split( '.' ).map( ( part, index ) => (
		<Fragment key={ index }>
			{ index > 0 && (
				<>
					<wbr />.
				</>
			) }
			{ part }
		</Fragment>
	) );

/**
 * The WordPress source and where it's going, with what happens to each, before the migration is set up.
 */
export const SiteMigrationConfirm = ( {
	topBar,
	from,
	hostname,
	destinationSiteSlug,
	destinationSiteUrl,
	destinationFailed = false,
	isSameSite,
	onChangeSource,
	onChangeDestination,
	onContinue,
	onRetryDestination,
	sourceIssue,
	title: titleOverride,
	subTitle: subTitleOverride,
	includesLabel,
	includes,
	platformName,
}: {
	topBar: ReactNode;
	from: string;
	hostname: string;
	destinationSiteSlug?: string;
	destinationSiteUrl?: string;
	destinationFailed?: boolean;
	isSameSite: boolean;
	/** Without it, the source has no Change link. */
	onChangeSource?: () => void;
	/** Without it, the destination has no Change link. */
	onChangeDestination?: () => void;
	onContinue: () => void;
	onRetryDestination?: () => void;
	sourceIssue?: SourceIssue;
	/** Replaces the heading when nothing needs the customer's attention. */
	title?: TranslateResult;
	/** Replaces the sub-heading when nothing needs the customer's attention. */
	subTitle?: TranslateResult;
	/** Replaces the label above the checklist. */
	includesLabel?: TranslateResult;
	/** Replaces the checklist for a new site. */
	includes?: TranslateResult[];
	/** The platform the source is known to run on, such as Wix, named under its address. */
	platformName?: string;
} ) => {
	const translate = useTranslate();
	const hasDestination = !! destinationSiteSlug || destinationFailed;
	const willReplace = hasDestination && ! destinationFailed && ! isSameSite;
	const showLoadError = destinationFailed && ! isSameSite;
	const shownSourceIssue = isSameSite || showLoadError ? undefined : sourceIssue;
	const showUnreachable = shownSourceIssue?.type === 'unreachable';
	const showNotWordPress = shownSourceIssue?.type === 'unconfirmed';
	const sourcePlatformName =
		shownSourceIssue?.type === 'unconfirmed' ? shownSourceIssue.platformName : undefined;
	const knownPlatformName = shownSourceIssue ? undefined : platformName;
	const hasNotice = isSameSite || showLoadError || showUnreachable || showNotWordPress;
	const destinationAddress = destinationSiteSlug ?? '';
	// A new site sits beside a short source. A picked destination, or a long source address, stacks.
	const isSideBySide = ! hasDestination && hostname.length <= 26;

	let title = titleOverride ?? translate( 'We can copy your whole site' );
	if ( isSameSite ) {
		title = translate( 'Pick two different sites' );
	} else if ( showNotWordPress || showUnreachable ) {
		title = translate( 'Is this a WordPress site?' );
	}
	const subTitle = hasNotice
		? undefined
		: ( subTitleOverride ??
			translate(
				'It runs on WordPress, so everything comes across: pages, posts, media, theme, plugins and settings.'
			) );

	const includedItems = includes ?? [
		translate( 'Pages, posts and media' ),
		translate( 'Your theme and plugins' ),
		translate( 'Your settings' ),
	];

	let primaryAction: { label: TranslateResult; onClick: () => void } | undefined = {
		label: hasDestination ? translate( 'Replace and continue' ) : translate( 'Continue' ),
		onClick: onContinue,
	};
	if ( isSameSite ) {
		primaryAction = onChangeSource && {
			label: translate( 'Change the address' ),
			onClick: onChangeSource,
		};
	} else if ( showLoadError ) {
		primaryAction = onRetryDestination && {
			label: translate( 'Try again' ),
			onClick: onRetryDestination,
		};
	} else if ( ( showNotWordPress || showUnreachable ) && ! hasDestination ) {
		primaryAction = {
			label: translate( 'My site is WordPress, continue' ),
			onClick: onContinue,
		};
	}

	return (
		<>
			<DocumentHead title={ title } />
			<Step.WideLayout className="site-migration-confirm" topBar={ topBar }>
				<div className="site-migration-confirm__split">
					<div className="site-migration-confirm__main">
						<Step.Heading align="left" text={ title } subText={ subTitle } />
						{ isSameSite && (
							<Notice.Root intent="error" role="alert">
								<Notice.Title>{ translate( 'You picked the same site twice' ) }</Notice.Title>
								<Notice.Description>
									{ translate(
										'A site can’t be copied into itself. Change the address you’re moving from, or pick another place for it to go.'
									) }
								</Notice.Description>
							</Notice.Root>
						) }
						{ showUnreachable && (
							<Notice.Root intent="error" role="alert">
								<Notice.Title>{ translate( 'We couldn’t reach your site' ) }</Notice.Title>
								<Notice.Description>
									{ translate(
										'Check that the address you entered is correct and that the site loads in your browser.'
									) }
								</Notice.Description>
							</Notice.Root>
						) }
						{ showNotWordPress && (
							<Notice.Root intent="warning" role="alert">
								<Notice.Title>
									{ sourcePlatformName
										? translate( 'This looks like a %(platform)s site', {
												args: { platform: sourcePlatformName },
												comment: 'The platform the site seems to be built on, e.g. Wix.',
											} )
										: translate( 'We couldn’t confirm this is a WordPress site' ) }
								</Notice.Title>
								<Notice.Description>
									{ translate(
										'We can only copy active WordPress sites using this migration tool.'
									) }
								</Notice.Description>
							</Notice.Root>
						) }
						{ showLoadError && (
							<Notice.Root intent="error" role="alert">
								<Notice.Title>{ translate( 'We couldn’t load the site you picked' ) }</Notice.Title>
								<Notice.Description>
									{ translate( 'Try again in a moment, or pick another site to move into.' ) }
								</Notice.Description>
							</Notice.Root>
						) }
						<div
							className={ clsx( 'site-migration-confirm__route', {
								'site-migration-confirm__route--side-by-side': isSideBySide,
								'site-migration-confirm__route--last': isSameSite || showLoadError,
							} ) }
						>
							<div className="site-migration-confirm__site">
								{ ! knownPlatformName && (
									<span className="site-migration-confirm__label">
										{ showNotWordPress && sourcePlatformName
											? translate( 'From · %(platform)s', {
													args: { platform: sourcePlatformName },
													comment: 'The platform the site seems to be built on, e.g. Wix.',
												} )
											: translate( 'From your WordPress site' ) }
									</span>
								) }
								<span className="site-migration-confirm__address">
									{ wrappableAddress( hostname ) }
								</span>
								{ knownPlatformName && (
									<span className="site-migration-confirm__label">
										{ translate( 'On %(platform)s today', {
											args: { platform: knownPlatformName },
											comment: 'The platform the site is built on, e.g. Wix.',
										} ) }
									</span>
								) }
								{ showUnreachable && (
									<span className="site-migration-confirm__error">
										{ translate( 'Not loading right now' ) }
									</span>
								) }
								{ isSameSite && (
									<span className="site-migration-confirm__error">
										{ translate( 'Same as the destination' ) }
									</span>
								) }
								{ onChangeSource && (
									<Step.LinkButton
										className="site-migration-confirm__change"
										onClick={ onChangeSource }
										aria-label={ translate( 'Change the site to copy' ) }
									>
										{ translate( 'Change' ) }
									</Step.LinkButton>
								) }
							</div>
							<Icon className="site-migration-confirm__arrow" icon={ arrowDown } size={ 24 } />
							<div className="site-migration-confirm__site">
								{ knownPlatformName && ! hasDestination ? (
									<>
										<span className="site-migration-confirm__address">
											{ translate( 'A new site' ) }
										</span>
										<span className="site-migration-confirm__label">
											{ translate( 'On WordPress.com' ) }
										</span>
									</>
								) : (
									<>
										<span className="site-migration-confirm__label">
											{ hasDestination
												? translate( 'To your existing WordPress.com site' )
												: translate( 'To' ) }
										</span>
										<span className="site-migration-confirm__address">
											{ hasDestination
												? wrappableAddress( destinationAddress )
												: translate( 'A new WordPress.com site' ) }
										</span>
									</>
								) }
								{ onChangeDestination && (
									<Step.LinkButton
										className="site-migration-confirm__change"
										onClick={ onChangeDestination }
										aria-label={ translate( 'Change the destination site' ) }
									>
										{ translate( 'Change' ) }
									</Step.LinkButton>
								) }
								{ showLoadError && (
									<span className="site-migration-confirm__error">
										{ translate( 'Couldn’t load' ) }
									</span>
								) }
								{ willReplace && (
									<span className="site-migration-confirm__warning">
										{ translate( 'Everything on this site will be replaced.' ) }
									</span>
								) }
							</div>
						</div>
						{ ! hasDestination && (
							<div className="site-migration-confirm__includes">
								<span className="site-migration-confirm__label">
									{ includesLabel ?? translate( 'What we’ll copy over' ) }
								</span>
								<ul>
									{ includedItems.map( ( item, index ) => (
										<li key={ index }>
											<Icon icon={ check } size={ 20 } />
											{ item }
										</li>
									) ) }
								</ul>
							</div>
						) }
						{ primaryAction && (
							<Step.PrimaryButton
								className="site-migration-confirm__primary"
								onClick={ primaryAction.onClick }
							>
								{ primaryAction.label }
							</Step.PrimaryButton>
						) }
					</div>
					<SitePreviewPanel
						className={ clsx( { 'site-migration-confirm__panel--compare': willReplace } ) }
					>
						{ willReplace && (
							<p className="site-migration-confirm__caption">
								{ translate( '%(site)s today: this is what we’ll copy', {
									args: { site: hostname },
									comment: 'The address of the site being copied, e.g. example.com.',
								} ) }
							</p>
						) }
						<SiteWindow url={ from } address={ hostname } isUnavailable={ showUnreachable } />
						{ willReplace && (
							<>
								<Icon
									className="site-migration-confirm__panel-arrow"
									icon={ arrowDown }
									size={ 40 }
								/>
								<div className="site-migration-confirm__caption">
									<p>{ destinationAddress }</p>
									<span className="site-migration-confirm__tag">
										{ translate( 'Everything on this site will be replaced' ) }
									</span>
								</div>
								<SiteWindow
									url={ destinationSiteUrl || `https://${ destinationAddress }` }
									address={ destinationAddress }
								/>
							</>
						) }
					</SitePreviewPanel>
				</div>
			</Step.WideLayout>
		</>
	);
};
