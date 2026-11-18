import { formatNumber } from '@automattic/number-formatters';
import {
	Spinner,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, border, caution, check, published } from '@wordpress/icons';
import { Badge, Progress } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import { formatStorage } from '../../utils/site-storage';
import { getSourceHost } from './use-static-site-import';
import type { StaticSiteImport, StaticSiteImportSearch } from './use-static-site-import';
import type {
	StaticSiteImportBand,
	StaticSiteImportDelivery,
	StaticSiteImportCapability,
	StaticSiteImportInspection,
	StaticSiteImportPreviewSummary,
	StaticSiteImportProgress,
	StaticSiteImportSession,
} from '@automattic/api-core';

import './style.scss';

/**
 * The checklist item the move is on, from what the server reports: the runner finds the source's
 * pages, copies them, builds the WordPress site from the copy, and wpcom then delivers it here.
 */
function getCurrentStep( session?: StaticSiteImportSession ) {
	const progress = session?.progress;
	switch ( session?.state ) {
		case 'capturing':
			return progress?.pages_total && ! progress.finding_pages ? 1 : 0;
		case 'building':
			return 2;
		case 'preview_ready':
		case 'queued':
		case 'finished':
			return 3;
		default:
			return 0;
	}
}

const formatCount = ( current: number, total: number ) =>
	sprintf(
		/* translators: %1$s: formatted number of pages done so far, %2$s: formatted number of pages in all. */
		__( '%1$s of %2$s' ),
		formatNumber( current ),
		formatNumber( total )
	);

function formatDuration( seconds: number ) {
	const whole = Math.max( 0, Math.floor( seconds ) );
	if ( whole < 60 ) {
		return sprintf(
			/* translators: %s: a number of seconds, e.g. "42s". */
			__( '%ss' ),
			formatNumber( whole )
		);
	}
	return sprintf(
		/* translators: %1$s: minutes, %2$s: seconds with a leading zero, e.g. "3m 05s". */
		__( '%1$sm %2$ss' ),
		formatNumber( Math.floor( whole / 60 ) ),
		String( whole % 60 ).padStart( 2, '0' )
	);
}

const COPIED_PAGES_SHOWN = 6;

/** A page path as the reader would type it, e.g. `/café/` rather than `/caf%C3%A9/`. */
function readablePath( path: string ) {
	try {
		return decodeURIComponent( path );
	} catch {
		return path;
	}
}

/**
 * What the build is doing, from the importer's own step. Steps that work page by page also say how
 * many pages are done. Servers that don't report the step show no detail.
 */
function getBuildDetail( progress?: StaticSiteImportProgress ) {
	if ( progress?.phase === 'exporting' ) {
		return __( 'Packaging your site' );
	}
	const building = progress?.building;
	if ( ! building ) {
		return progress?.phase === 'building' ? __( 'Setting up WordPress' ) : '';
	}
	const count = building.total > 0 ? formatCount( building.current, building.total ) : '';
	switch ( building.stage ) {
		case 'freezing':
		case 'prepare_shared':
		case 'preparing_shared':
			return __( 'Preparing your styles and layout' );
		case 'prepare_pages':
		case 'preparing_pages':
			return count
				? sprintf(
						/* translators: %s: progress such as "3 of 12". */
						__( 'Preparing your pages · %s' ),
						count
					)
				: __( 'Preparing your pages' );
		case 'compile_pages':
		case 'compiling_pages':
			return count
				? sprintf(
						/* translators: %s: progress such as "3 of 12". */
						__( 'Turning your pages into blocks · %s' ),
						count
					)
				: __( 'Turning your pages into blocks' );
		case 'compose':
		case 'composed':
		case 'canonical_plan':
			return __( 'Putting your theme together' );
		case 'prepare_lifecycle':
		case 'dependencies_prepared':
		case 'materialize':
		case 'materialization_claimed':
		case 'completed':
			return __( 'Creating your pages and theme' );
		default:
			return '';
	}
}

/** What capture is doing right now: the page it saved last, or the stage that ends it. */
function getCopyActivity( progress?: StaticSiteImportProgress ) {
	switch ( progress?.capture_stage ) {
		case 'media':
			return __( 'Saving your images' );
		case 'finalizing':
			return __( 'Saving your pages' );
	}
	const page = progress?.current_page;
	if ( ! page ) {
		return '';
	}
	return page === '/'
		? __( 'Copied your home page' )
		: sprintf(
				/* translators: %s: the path of a page on the site being moved, e.g. /about-us/. */
				__( 'Copied %s' ),
				readablePath( page )
			);
}

function getFindActivity( progress?: StaticSiteImportProgress ) {
	if ( progress?.finding_pages ) {
		return __( 'Following the links between your pages' );
	}
	return progress?.phase === 'inspecting' ? __( 'Looking at how your site is built' ) : '';
}

/**
 * How far the whole move is, out of 100. Copying and building are weighted by the pages they've
 * done; delivery reports nothing, so it holds near the end until the site is ready.
 */
/** What the restore onto the site is doing, in the reader's words. */
function getDeliveryActivity( delivery?: StaticSiteImportDelivery ) {
	switch ( delivery?.stage ) {
		case 'preparing':
			return __( 'Getting your site ready to move' );
		case 'convert_to_atomic':
			return __( 'Setting up your site’s hosting' );
		case 'download_archive':
			return __( 'Sending your site to its new home' );
		case 'unpack_file':
			return __( 'Unpacking your site' );
		case 'preprocess':
			return __( 'Preparing your files' );
		case 'process_files':
			return __( 'Copying your files' );
		case 'recreate_database':
		case 'postprocess_database':
			return __( 'Setting up your content' );
		case 'verify_site_integrity':
			return __( 'Checking everything works' );
		case 'clean_up':
			return __( 'Finishing up' );
		default:
			return '';
	}
}

function getOverallProgress( session?: StaticSiteImportSession ) {
	const progress = session?.progress;
	const fraction = ( current = 0, total = 0 ) => ( total > 0 ? Math.min( current / total, 1 ) : 0 );
	switch ( getCurrentStep( session ) ) {
		case 0:
			return progress?.finding_pages ? 6 : 2;
		case 1:
			if ( progress?.capture_stage === 'finalizing' ) {
				return 46;
			}
			if ( progress?.capture_stage === 'media' ) {
				return 43;
			}
			return 10 + 30 * fraction( progress?.pages_captured, progress?.pages_total );
		case 2: {
			if ( progress?.phase === 'exporting' ) {
				return 86;
			}
			const building = progress?.building;
			const pages = fraction( building?.current, building?.total );
			switch ( building?.stage ) {
				case undefined:
					return 48;
				case 'freezing':
				case 'prepare_shared':
				case 'preparing_shared':
					return 52;
				case 'prepare_pages':
				case 'preparing_pages':
					return 54 + 6 * pages;
				case 'compile_pages':
				case 'compiling_pages':
					return 60 + 16 * pages;
				case 'compose':
				case 'composed':
				case 'canonical_plan':
					return 78;
				default:
					return 82;
			}
		}
		default: {
			const delivery = progress?.delivery;
			if ( ! delivery?.total_steps ) {
				return 88;
			}
			// Within copying files, the files themselves fill the step.
			const files =
				delivery.stage === 'process_files'
					? fraction( delivery.files?.done, delivery.files?.total )
					: 0;
			return 88 + 11 * fraction( delivery.step - 1 + files, delivery.total_steps );
		}
	}
}

/** The current time in seconds, ticking once a second while `isRunning`. */
function useNow( isRunning: boolean ) {
	const [ now, setNow ] = useState( () => Date.now() / 1000 );
	useEffect( () => {
		if ( ! isRunning ) {
			return;
		}
		setNow( Date.now() / 1000 );
		const timer = setInterval( () => setNow( Date.now() / 1000 ), 1000 );
		return () => clearInterval( timer );
	}, [ isRunning ] );
	return now;
}

/** Never lets a value go back down, so a step the server reports out of order can't rewind the bar. */
function useHighWater( value: number ) {
	const highest = useRef( value );
	highest.current = Math.max( highest.current, value );
	return highest.current;
}

/** Each new line rolls up into view as the last rolls out, so it's clear the move is going on. */
function RollingLine( { text, className }: { text: string; className?: string } ) {
	const [ shown, setShown ] = useState( text );
	const [ leaving, setLeaving ] = useState< string | null >( null );

	if ( text !== shown ) {
		setLeaving( shown || null );
		setShown( text );
	}

	return (
		<span role="status" className={ clsx( 'static-site-import-rolling', className ) }>
			{ /* Keyed by line, so the outgoing one keeps its node (and any page translation) as it rolls out. */ }
			{ [ leaving, shown ].map(
				( line ) =>
					line && (
						<span
							key={ line }
							aria-hidden={ line === leaving || undefined }
							className={ clsx( 'static-site-import-rolling__line', {
								'is-leaving': line === leaving,
								'is-entering': line === shown && leaving,
							} ) }
							onAnimationEnd={ line === leaving ? () => setLeaving( null ) : undefined }
						>
							{ line }
						</span>
					)
			) }
		</span>
	);
}

/**
 * A browser window onto the site being moved. Its address follows the page being copied, and once
 * capture has a screenshot of the home page, that fills the window.
 */
function SiteSnapshot( {
	sourceHost,
	destinationHost,
	session,
	step,
}: {
	sourceHost: string;
	/** Shown in the address bar once the copy is being built there, when given. */
	destinationHost?: string;
	session?: StaticSiteImportSession;
	step: number;
} ) {
	const progress = session?.progress;
	// Each poll signs the link afresh. Keep the first one so the image doesn't reload every few
	// seconds, and move to the newest only if the kept one stops working.
	const latestImageUrl = session?.preview_image_url;
	const [ imageUrl, setImageUrl ] = useState( latestImageUrl );
	const [ hasLoaded, setHasLoaded ] = useState( false );
	if ( ! imageUrl && latestImageUrl ) {
		setImageUrl( latestImageUrl );
	}
	const path =
		step === 1 && progress?.current_page && ! progress.capture_stage
			? readablePath( progress.current_page )
			: '/';
	// The pages seen copied while watching, newest first. The server only names the latest one.
	const [ copied, setCopied ] = useState< string[] >( [] );
	const pagesRef = useRef< HTMLOListElement >( null );
	// Each new page pushes the list down by one row, which snaps into place.
	useLayoutEffect( () => {
		const list = pagesRef.current;
		const newest = list?.firstElementChild as HTMLElement | null;
		if (
			! list ||
			! newest ||
			copied.length < 2 ||
			typeof list.animate !== 'function' ||
			window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches
		) {
			return;
		}
		const row = newest.offsetHeight + parseFloat( getComputedStyle( list ).rowGap || '0' );
		// The rows move, not the list, so the list's fade at the bottom stays put.
		Array.from( list.children ).forEach( ( item ) =>
			item.animate( [ { transform: `translateY( -${ row }px )` }, { transform: 'none' } ], {
				duration: 500,
				easing: 'cubic-bezier( 0.34, 1.56, 0.64, 1 )',
			} )
		);
	}, [ copied.length ] );
	if ( step === 1 && progress?.current_page && ! copied.includes( progress.current_page ) ) {
		setCopied( [ progress.current_page, ...copied ] );
	}

	return (
		<figure
			className={ clsx( 'static-site-import-snapshot', {
				'is-copying': step <= 1,
				'is-building': step === 2,
				'has-image': hasLoaded,
				'has-pages': copied.length > 0,
			} ) }
		>
			<div className="static-site-import-snapshot__bar" aria-hidden="true">
				<span className="static-site-import-snapshot__dots" />
				<span className="static-site-import-snapshot__address">
					<span className="static-site-import-snapshot__host">
						{ ( step >= 2 && destinationHost ) || sourceHost || __( 'Your site' ) }
					</span>
					<RollingLine text={ path === '/' ? '' : path } />
				</span>
			</div>
			<div className="static-site-import-snapshot__viewport">
				<div className="static-site-import-snapshot__wireframe" aria-hidden="true">
					<span />
					<span />
					<span />
					<span />
					<span />
				</div>
				{ copied.length > 0 && (
					<ol ref={ pagesRef } className="static-site-import-snapshot__pages" aria-hidden="true">
						{ copied.slice( 0, COPIED_PAGES_SHOWN ).map( ( page ) => (
							<li key={ page }>
								<Icon icon={ check } size={ 20 } />
								<span>{ page === '/' ? __( 'Home page' ) : readablePath( page ) }</span>
							</li>
						) ) }
					</ol>
				) }
				{ imageUrl && (
					<img
						className="static-site-import-snapshot__image"
						src={ imageUrl }
						alt={
							sourceHost
								? sprintf(
										/* translators: %s: the domain of the site being moved, e.g. example.com. */
										__( 'The home page of %s' ),
										sourceHost
									)
								: __( 'The home page of your current site' )
						}
						onLoad={ () => setHasLoaded( true ) }
						onError={ () => {
							if ( latestImageUrl && latestImageUrl !== imageUrl ) {
								setImageUrl( latestImageUrl );
							}
						} }
					/>
				) }
				<span className="static-site-import-snapshot__scan" aria-hidden="true" />
			</div>
		</figure>
	);
}

// Nearly every site has menus, so finding them says nothing.
const getCapabilityLabels = (): Partial< Record< StaticSiteImportCapability, string > > => ( {
	booking: __( 'Bookings' ),
	commerce: __( 'Store' ),
	dialogs: __( 'Pop-ups' ),
	embeds: __( 'Embeds' ),
	events: __( 'Events' ),
	forms: __( 'Forms' ),
	media: __( 'Images and video' ),
	membership: __( 'Members area' ),
} );

const getBandLabels = (): Partial< Record< StaticSiteImportBand, string > > => ( {
	simple: __( 'Simple' ),
	moderate: __( 'Moderate' ),
	complex: __( 'Complex' ),
} );

const getFactor = ( inspection: StaticSiteImportInspection | null | undefined, code: string ) =>
	inspection?.factors?.find( ( factor ) => factor.code === code )?.value;

/** What the build's checks found, once it has run them: each one passed, or how much it missed. */
function getChecks( summary?: StaticSiteImportPreviewSummary ) {
	const checks: { label: string; passed: boolean }[] = [];
	const { content_loss, images_missing_source, unresolved_internal_links } = summary ?? {};
	if ( typeof content_loss === 'number' ) {
		checks.push( {
			passed: content_loss === 0,
			label: content_loss === 0 ? __( 'No content lost' ) : __( 'Some content didn’t come over' ),
		} );
	}
	if ( typeof images_missing_source === 'number' ) {
		checks.push( {
			passed: images_missing_source === 0,
			label:
				images_missing_source === 0
					? __( 'Every image found' )
					: sprintf(
							/* translators: %s: formatted number of images, e.g. "3". */
							_n( '%s image is missing', '%s images are missing', images_missing_source ),
							formatNumber( images_missing_source )
						),
		} );
	}
	if ( typeof unresolved_internal_links === 'number' ) {
		checks.push( {
			passed: unresolved_internal_links === 0,
			label:
				unresolved_internal_links === 0
					? __( 'No broken links' )
					: sprintf(
							/* translators: %s: formatted number of links, e.g. "3". */
							_n( '%s link needs fixing', '%s links need fixing', unresolved_internal_links ),
							formatNumber( unresolved_internal_links )
						),
		} );
	}
	return checks;
}

type Fact = { label: string; value?: number | string; format?: ( value: number ) => string };

/** Everything the move has to tell about the old site and the new one, as soon as it's known. */
function MoveFacts( { session, locale }: { session?: StaticSiteImportSession; locale: string } ) {
	const progress = session?.progress;
	const summary = ( Array.isArray( session?.preview_summary ) ? {} : session?.preview_summary ) as
		StaticSiteImportPreviewSummary | undefined;
	const inspection = session?.assessment ?? summary?.inspection;
	const band = inspection?.observed_band ?? inspection?.band;
	const facts = (
		[
			{
				label: __( 'Pages' ),
				value: progress?.pages_total || progress?.source?.pages_found || inspection?.routes,
			},
			{ label: __( 'Pages built' ), value: summary?.pages },
			{ label: __( 'Images seen' ), value: getFactor( inspection, 'images' ) },
			{ label: __( 'Files saved' ), value: progress?.captured?.files },
			{
				label: __( 'Copied' ),
				value: progress?.captured?.bytes,
				format: ( bytes: number ) => formatStorage( bytes, locale ),
			},
			{ label: __( 'Blocks built' ), value: summary?.blocks },
			{ label: __( 'Complexity' ), value: band ? getBandLabels()[ band ] : undefined },
			{ label: __( 'Your domain' ), value: session?.connectable_domain || undefined },
		] as Fact[]
	 ).filter( ( fact ): fact is Fact & { value: number | string } => Boolean( fact.value ) );
	const labels = getCapabilityLabels();
	const found = Object.entries( inspection?.capabilities ?? {} )
		.filter( ( [ capability, count ] ) => count && capability in labels )
		.map( ( [ capability ] ) => labels[ capability as StaticSiteImportCapability ] as string );
	const checks = getChecks( summary );

	if ( ! facts.length && ! found.length && ! checks.length ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			{ facts.length > 0 && (
				<dl className="static-site-import-facts">
					{ facts.map( ( fact ) => (
						<div key={ fact.label } className="static-site-import-facts__item">
							<dt>
								<Text variant="muted">{ fact.label }</Text>
							</dt>
							<dd>
								<Text size={ 20 } weight={ 600 }>
									{ typeof fact.value === 'string'
										? fact.value
										: ( fact.format ?? formatNumber )( fact.value ) }
								</Text>
							</dd>
						</div>
					) ) }
				</dl>
			) }
			{ found.length > 0 && (
				<VStack spacing={ 2 }>
					<Text variant="muted">{ __( 'Found on your site' ) }</Text>
					<HStack justify="flex-start" spacing={ 2 } wrap>
						{ found.map( ( label ) => (
							<Badge key={ label } intent="none">
								{ label }
							</Badge>
						) ) }
					</HStack>
				</VStack>
			) }
			{ checks.length > 0 && (
				<VStack spacing={ 2 }>
					<Text variant="muted">{ __( 'Checked after the build' ) }</Text>
					<ul className="static-site-import-checks">
						{ checks.map( ( item ) => (
							<li key={ item.label }>
								<Icon
									icon={ item.passed ? check : caution }
									size={ 20 }
									className={ clsx( 'static-site-import-checks__icon', {
										'is-passed': item.passed,
									} ) }
								/>
								<Text>{ item.label }</Text>
							</li>
						) ) }
					</ul>
				</VStack>
			) }
		</VStack>
	);
}

function MovingChecklist( {
	session,
	lastLabel = __( 'Moving it onto your site' ),
}: {
	session?: StaticSiteImportSession;
	lastLabel?: string;
} ) {
	const progress = session?.progress;
	const current = getCurrentStep( session );
	const delivery = progress?.delivery;
	const startedAt =
		current === 3
			? ( delivery?.restore_started_at ?? delivery?.started_at ?? delivery?.stage_started_at )
			: progress?.phase_started_at;
	const now = useNow( Boolean( startedAt ) );
	const pagesTotal = progress?.pages_total;
	// Until the capture settles on its total, the inspection's count is all that's known.
	const pagesFoundSoFar = progress?.source?.pages_found;
	let pagesFoundDetail = '';
	if ( pagesTotal ) {
		pagesFoundDetail = sprintf(
			/* translators: %s: formatted number of pages found on the site being moved. */
			_n( '%s page found', '%s pages found', pagesTotal ),
			formatNumber( pagesTotal )
		);
	} else if ( pagesFoundSoFar ) {
		pagesFoundDetail = sprintf(
			/* translators: %s: formatted number of pages found so far on the site being moved; more may follow. */
			_n( '%s page found so far', '%s pages found so far', pagesFoundSoFar ),
			formatNumber( pagesFoundSoFar )
		);
	}
	const items = [
		{
			label: __( 'Finding your pages' ),
			activity: pagesFoundDetail || ( current === 0 ? getFindActivity( progress ) : '' ),
			count: '',
			seconds: progress?.step_seconds?.inspecting,
		},
		{
			label: __( 'Copying your pages' ),
			activity: current === 1 ? getCopyActivity( progress ) : '',
			count:
				current === 1 && pagesTotal ? formatCount( progress?.pages_captured ?? 0, pagesTotal ) : '',
			seconds: progress?.step_seconds?.capturing,
		},
		{
			label: __( 'Building your WordPress site' ),
			activity: current === 2 ? getBuildDetail( progress ) : '',
			count: '',
			seconds: undefined,
		},
		{
			label: lastLabel,
			activity: current === 3 ? getDeliveryActivity( delivery ) : '',
			count:
				current === 3 && delivery?.stage === 'process_files' && delivery.files?.total
					? formatCount( delivery.files.done, delivery.files.total )
					: '',
			seconds: undefined,
		},
	];

	return (
		<VStack as="ol" spacing={ 0 } className="static-site-import-steps">
			{ items.map( ( item, index ) => {
				const isDone = index < current;
				const isCurrent = index === current;
				const elapsed = isCurrent && startedAt ? formatDuration( now - startedAt ) : '';
				const took = isDone && item.seconds ? formatDuration( item.seconds ) : '';
				return (
					<HStack
						as="li"
						key={ item.label }
						justify="flex-start"
						alignment="top"
						spacing={ 3 }
						className={ clsx( 'static-site-import-steps__item', {
							'is-done': isDone,
							'is-current': isCurrent,
						} ) }
						aria-current={ isCurrent ? 'step' : undefined }
					>
						<span className="static-site-import-steps__marker">
							{ isDone && <Icon icon={ published } size={ 32 } /> }
							{ isCurrent && <Spinner className="static-site-import-steps__spinner" /> }
							{ ! isDone && ! isCurrent && <Icon icon={ border } size={ 32 } /> }
						</span>
						<VStack spacing={ 1 } className="static-site-import-steps__body">
							<Text
								weight={ isCurrent ? 600 : undefined }
								variant={ isDone || isCurrent ? undefined : 'muted' }
							>
								{ item.label }
							</Text>
							{ isCurrent ? (
								<RollingLine
									text={ item.activity }
									className="static-site-import-steps__activity"
								/>
							) : (
								item.activity && <Text variant="muted">{ item.activity }</Text>
							) }
						</VStack>
						{ ( item.count || elapsed || took ) && (
							<VStack spacing={ 0 } alignment="right" className="static-site-import-steps__meta">
								{ item.count && <Text weight={ 600 }>{ item.count }</Text> }
								{ ( elapsed || took ) && <Text variant="muted">{ elapsed || took }</Text> }
							</VStack>
						) }
					</HStack>
				);
			} ) }
		</VStack>
	);
}

function MoveProgressBar( { session }: { session?: StaticSiteImportSession } ) {
	const overall = useHighWater( getOverallProgress( session ) );
	return (
		<Progress.Root
			className="static-site-import-moving__progress"
			aria-label={ __( 'Move progress' ) }
			value={ overall }
		>
			<Progress.Track>
				<Progress.Indicator />
			</Progress.Track>
		</Progress.Root>
	);
}

/** The move's overall progress and its steps, for a page of its own while a preview is built. */
export function StaticSiteImportPreviewSteps( { siteImport }: { siteImport: StaticSiteImport } ) {
	return (
		<VStack spacing={ 8 } className="static-site-import-preview-steps">
			<MoveProgressBar session={ siteImport.session } />
			<MovingChecklist
				session={ siteImport.session }
				lastLabel={ __( 'Getting your preview ready' ) }
			/>
		</VStack>
	);
}

/** A window onto the site as it's copied, then onto the copy as it's built. */
export function StaticSiteImportPreviewWindow( {
	siteImport,
	search,
}: {
	siteImport: StaticSiteImport;
	search: StaticSiteImportSearch;
} ) {
	const sourceHost = getSourceHost( search.from );
	const session = siteImport.session;
	const step = getCurrentStep( session );
	const destinationHost = getSourceHost( session?.site_url );
	let caption: string = sourceHost
		? sprintf(
				/* translators: %s: the domain of the site being copied, e.g. example.com. */
				__( 'Copying from %s' ),
				sourceHost
			)
		: __( 'Copying your site' );
	if ( step === 2 ) {
		caption = __( 'Building your copy on WordPress.com' );
	} else if ( step === 3 ) {
		caption = __( 'Your copy on WordPress.com' );
	}

	return (
		<VStack spacing={ 2 } className="static-site-import-preview-window">
			<Text className="static-site-import-preview-window__caption">{ caption }</Text>
			<SiteSnapshot
				sourceHost={ sourceHost }
				destinationHost={ destinationHost }
				session={ session }
				step={ step }
			/>
		</VStack>
	);
}

/** Takes the place of the overview cards while the site is being moved. */
export function StaticSiteImportProgress( {
	siteImport,
	search,
	locale,
	email,
}: {
	siteImport: StaticSiteImport;
	search: StaticSiteImportSearch;
	/** Where the ready email goes, named in the card when given. */
	email?: string;
	/** A BCP 47 language tag for formatting numbers, such as `useIntlLocale()` returns. */
	locale: string;
} ) {
	const sourceHost = getSourceHost( search.from );
	const session = siteImport.session;
	const step = getCurrentStep( session );

	return (
		<Card>
			<CardBody>
				<div className="static-site-import-moving">
					<div className="static-site-import-moving__snapshot">
						<SiteSnapshot sourceHost={ sourceHost } session={ session } step={ step } />
					</div>
					<div className="static-site-import-moving__facts">
						<MoveFacts session={ session } locale={ locale } />
					</div>
					<VStack spacing={ 6 } className="static-site-import-moving__main">
						<VStack spacing={ 2 }>
							<Heading level={ 2 } size={ 20 } weight={ 600 }>
								{ __( 'We’re moving your site' ) }
							</Heading>
							<Text variant="muted">
								{ sourceHost
									? sprintf(
											/* translators: %s: the domain of the site being moved, e.g. example.com. */
											__( 'We’re rebuilding %s here. Your current site stays live and unchanged.' ),
											sourceHost
										)
									: __(
											'We’re rebuilding your site here. Your current site stays live and unchanged.'
										) }
							</Text>
						</VStack>
						<Notice variant="info">
							{ email
								? createInterpolateElement(
										sprintf(
											/* translators: %s: the email address the ready email goes to, e.g. name@example.com. */
											__(
												'You can close this page. We’ll email you at <strong>%s</strong> when it’s done.'
											),
											email
										),
										{ strong: <strong /> }
									)
								: __( 'You can close this page. We’ll email you when it’s done.' ) }
						</Notice>
						<MoveProgressBar session={ session } />
						<MovingChecklist session={ session } />
					</VStack>
				</div>
			</CardBody>
		</Card>
	);
}
