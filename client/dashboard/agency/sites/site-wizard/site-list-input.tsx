import {
	Button,
	FlexBlock,
	TextControl,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	__experimentalItemGroup as ItemGroup,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __, _n, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useIntlLocale } from '../../../app/locale';
import { Card, CardBody } from '../../../components/card';
import SiteScreenshot from '../../components/site-screenshot';
import { parseSiteList, readSiteFile } from './site-intake';
import useSiteDiscovery, { getDetectedHost } from './use-site-discovery';
import type { IntakeSite } from './site-intake';

function serializeSites( sites: IntakeSite[] ) {
	return sites
		.map( ( site ) =>
			site.name === new URL( site.url ).hostname ? site.url : `${ site.name }\t${ site.url }`
		)
		.join( '\n' );
}

/**
 * A one-line address field that adds each site to a list below it. Pasting a
 * list or uploading a spreadsheet adds every address at once.
 */
export default function SiteListInput( {
	value,
	onChange,
	draft,
	onDraftChange,
	onError,
	error,
	managed,
	simulate,
}: {
	value: string;
	onChange: ( value: string ) => void;
	draft: string;
	onDraftChange: ( draft: string ) => void;
	onError: ( message: string ) => void;
	error: string;
	managed: string[];
	simulate?: boolean;
} ) {
	const fileInput = useRef< HTMLInputElement >( null );
	const [ reading, setReading ] = useState( false );
	const errorId = useId();
	const { sites } = parseSiteList( value );

	const add = ( input: string ) => {
		const incoming = parseSiteList( input ).sites;
		if ( ! incoming.length ) {
			onError(
				__(
					'We couldn’t find a website address. Try yourgroovydomain.com, or paste a list of addresses.'
				)
			);
			return;
		}
		const added = incoming.filter( ( site ) => ! sites.some( ( { id } ) => id === site.id ) );
		if ( ! added.length ) {
			onError( __( 'That site is already in your list.' ) );
			return;
		}
		onError( '' );
		onChange( serializeSites( [ ...sites, ...added ] ) );
		onDraftChange( '' );
	};

	const read = async ( file: File ) => {
		setReading( true );
		onError( '' );
		try {
			add( await readSiteFile( file ) );
		} catch ( error ) {
			onError(
				error instanceof Error && error.message === 'file-too-large'
					? __( 'Choose a file smaller than 5 MB.' )
					: __( 'We couldn’t read that file. Try an .xlsx, .csv, .tsv, or text file.' )
			);
		} finally {
			setReading( false );
		}
	};

	return (
		<VStack spacing={ 4 } className="agency-site-wizard__site-list">
			<VStack spacing={ 2 }>
				<HStack alignment="bottom" spacing={ 2 }>
					<FlexBlock>
						<TextControl
							label={ __( 'Site address' ) }
							hideLabelFromVision
							placeholder={ __( 'yourgroovydomain.com' ) }
							value={ draft }
							onChange={ ( next ) => {
								onDraftChange( next );
								onError( '' );
							} }
							aria-invalid={ !! error }
							aria-describedby={ error ? errorId : undefined }
							onKeyDown={ ( event ) => {
								if ( event.key === 'Enter' && ! event.nativeEvent.isComposing ) {
									event.preventDefault();
									add( draft );
								}
							} }
							onPaste={ ( event ) => {
								const text = event.clipboardData.getData( 'text' );
								if ( parseSiteList( text ).sites.length > 1 ) {
									event.preventDefault();
									add( text );
								}
							} }
							dir="ltr"
							spellCheck={ false }
							autoCapitalize="none"
							autoComplete="off"
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					</FlexBlock>
					<Button
						variant="secondary"
						onClick={ () => add( draft ) }
						disabled={ reading }
						__next40pxDefaultSize
					>
						{ __( 'Add to list' ) }
					</Button>
				</HStack>
				{ error && (
					<Text as="p" id={ errorId } role="alert" align="center" color="var( --color-error )">
						{ error }
					</Text>
				) }
				<Text variant="muted" align="center">
					{ createInterpolateElement(
						__( 'Paste several at once, or <upload>upload a spreadsheet</upload>.' ),
						{
							upload: (
								<Button
									variant="link"
									onClick={ () => fileInput.current?.click() }
									disabled={ reading }
									__next40pxDefaultSize
								/>
							),
						}
					) }
				</Text>
			</VStack>
			{ sites.length > 0 && (
				<SiteList
					// Newest first, so a site just added is never hidden in a long list.
					sites={ [ ...sites ].reverse() }
					simulate={ simulate }
					managed={ managed }
					scrolls
					onRemove={ ( site ) =>
						onChange( serializeSites( sites.filter( ( { id } ) => id !== site.id ) ) )
					}
				/>
			) }
			<input
				ref={ fileInput }
				type="file"
				accept=".xlsx,.csv,.tsv,.txt"
				aria-label={ __( 'Upload a site list' ) }
				hidden
				onChange={ ( event ) => {
					const file = event.currentTarget.files?.[ 0 ];
					if ( file ) {
						void read( file );
					}
					event.currentTarget.value = '';
				} }
			/>
		</VStack>
	);
}

/** A short summary of a batch: a few screenshots, the count, and the first names. */
export function SiteSummary( { sites, heading }: { sites: IntakeSite[]; heading?: string } ) {
	const locale = useIntlLocale();
	const namesRef = useRef< HTMLSpanElement >( null );
	const [ shownCount, setShownCount ] = useState( 3 );
	const formatNames = useCallback(
		( count: number ) => {
			const shown = sites.slice( 0, count ).map( ( site ) => site.name );
			const rest = sites.length - shown.length;
			return rest > 0
				? sprintf(
						/* translators: 1: A comma-separated list of site names. 2: The number of other sites. */
						_n( '%1$s, and %2$d more', '%1$s, and %2$d more', rest ),
						shown.join( ', ' ),
						rest
					)
				: new Intl.ListFormat( locale, { type: 'conjunction' } ).format( shown );
		},
		[ sites, locale ]
	);
	// Name as many sites as fit on one line at the current width.
	useLayoutEffect( () => {
		const element = namesRef.current;
		if ( ! element || typeof ResizeObserver === 'undefined' ) {
			return;
		}
		const context = document.createElement( 'canvas' ).getContext( '2d' );
		const fit = () => {
			if ( ! context ) {
				return;
			}
			const style = getComputedStyle( element );
			context.font = `${ style.fontWeight } ${ style.fontSize } ${ style.fontFamily }`;
			let count = 1;
			while (
				count < sites.length &&
				context.measureText( formatNames( count + 1 ) ).width <= element.clientWidth
			) {
				count++;
			}
			setShownCount( count );
		};
		const observer = new ResizeObserver( fit );
		observer.observe( element );
		return () => observer.disconnect();
	}, [ sites.length, formatNames ] );
	return (
		<Card>
			<CardBody>
				<HStack spacing={ 4 } justify="flex-start">
					<div className="agency-site-wizard__site-stack" aria-hidden="true">
						{ sites.slice( 0, 4 ).map( ( site ) => (
							<SiteScreenshot
								key={ site.id }
								url={ site.url }
								alt=""
								compact
								decorative
								width={ 64 }
								height={ 36 }
							/>
						) ) }
					</div>
					<FlexBlock>
						<VStack spacing={ 1 }>
							<Heading level={ 3 } size={ 15 } weight={ 500 }>
								{ heading ??
									sprintf(
										/* translators: %d is the number of sites. */
										_n( '%d site', '%d sites', sites.length ),
										sites.length
									) }
							</Heading>
							<Text ref={ namesRef } variant="muted" truncate>
								{ formatNames( shownCount ) }
							</Text>
						</VStack>
					</FlexBlock>
				</HStack>
			</CardBody>
		</Card>
	);
}

/** A heading with the number of sites, followed by the list of them. */
export function SiteListSummary( {
	sites,
	simulate,
	heading,
	onRemove,
	renderAction,
	describe,
}: {
	sites: IntakeSite[];
	simulate?: boolean;
	heading?: string;
	onRemove?: ( site: IntakeSite ) => void;
	renderAction?: ( site: IntakeSite ) => ReactNode;
	/** Replaces the detected host with a status for each site. */
	describe?: ( site: IntakeSite ) => string | undefined;
} ) {
	return (
		<VStack spacing={ 3 }>
			<Heading level={ 3 } size={ 15 } weight={ 500 }>
				{ heading ??
					sprintf(
						/* translators: %d is the number of sites. */
						_n( 'Adding %d site', 'Adding %d sites', sites.length ),
						sites.length
					) }
			</Heading>
			<SiteList
				sites={ sites }
				simulate={ simulate }
				onRemove={ onRemove }
				renderAction={ renderAction }
				describe={ describe }
			/>
		</VStack>
	);
}

/**
 * Sites with a screenshot, detected host, and optional remove button or action.
 */
export function SiteList( {
	sites,
	simulate,
	managed = [],
	onRemove,
	renderAction,
	describe,
	scrolls = false,
}: {
	sites: IntakeSite[];
	simulate?: boolean;
	managed?: string[];
	onRemove?: ( site: IntakeSite ) => void;
	renderAction?: ( site: IntakeSite ) => ReactNode;
	describe?: ( site: IntakeSite ) => string | undefined;
	/** Cap the list's height and scroll inside it. */
	scrolls?: boolean;
} ) {
	const scroller = useRef< HTMLDivElement >( null );
	const [ overflow, setOverflow ] = useState( { above: false, below: false } );
	const measure = useCallback( () => {
		const element = scroller.current;
		if ( ! element ) {
			return;
		}
		const above = element.scrollTop > 0;
		const below = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
		setOverflow( ( previous ) =>
			previous.above === above && previous.below === below ? previous : { above, below }
		);
	}, [] );
	useLayoutEffect( () => {
		const element = scroller.current;
		if ( ! element || typeof ResizeObserver === 'undefined' ) {
			return measure();
		}
		const observer = new ResizeObserver( measure );
		observer.observe( element );
		return () => observer.disconnect();
	}, [ measure, sites.length ] );
	const [ maxHeight, setMaxHeight ] = useState< number >();
	const hasSites = sites.length > 0;
	useLayoutEffect( () => {
		if ( ! scrolls ) {
			return;
		}
		// Fill the window below the list, leaving room for the step's buttons so they stay visible.
		const fit = () => {
			const element = scroller.current;
			if ( element ) {
				const top = element.getBoundingClientRect().top + window.scrollY;
				setMaxHeight( Math.max( 220, Math.round( window.innerHeight - top - 120 ) ) );
			}
		};
		fit();
		window.addEventListener( 'resize', fit );
		return () => window.removeEventListener( 'resize', fit );
	}, [ scrolls, hasSites ] );
	const list = (
		<ItemGroup
			ref={ scrolls ? scroller : undefined }
			onScroll={ scrolls ? measure : undefined }
			className={ clsx(
				'agency-site-wizard__site-list-items',
				scrolls && 'agency-site-wizard__site-list-scroll'
			) }
			style={ maxHeight ? { maxBlockSize: maxHeight } : undefined }
			isBordered
			isSeparated
		>
			{ sites.map( ( site ) => (
				<SiteListItem
					key={ site.id }
					site={ site }
					simulate={ simulate }
					isManaged={ managed.includes( site.id ) }
					onRemove={ onRemove ? () => onRemove( site ) : undefined }
					action={ renderAction?.( site ) }
					status={ describe?.( site ) }
				/>
			) ) }
		</ItemGroup>
	);
	if ( ! scrolls ) {
		return list;
	}
	// Fades at the edges show there's more to scroll to.
	return (
		<div
			className="agency-site-wizard__site-list-frame"
			data-more-above={ overflow.above || undefined }
			data-more-below={ overflow.below || undefined }
		>
			{ list }
		</div>
	);
}

function SiteListItem( {
	site,
	simulate,
	isManaged,
	onRemove,
	action,
	status,
}: {
	site: IntakeSite;
	simulate?: boolean;
	isManaged: boolean;
	onRemove?: () => void;
	action?: ReactNode;
	status?: string;
} ) {
	const discovery = useSiteDiscovery( site.url, false );
	const { container, reserved, analysis, hosting } = discovery;
	const domain = new URL( site.url ).hostname;
	const title =
		site.name === domain ? decodeEntities( analysis.data?.meta?.title || domain ) : site.name;
	let detail: string | undefined = getDetectedHost( discovery );
	if ( simulate && reserved ) {
		detail = [ 'WordPress.com', 'Pressable', 'WP Engine' ][ site.id.length % 3 ];
	} else if ( analysis.isFetching || hosting.isFetching ) {
		detail = __( 'Checking…' );
	}
	if ( isManaged ) {
		detail = __( 'Already in your dashboard' );
	}
	if ( status ) {
		detail = status;
	}
	// Without a site name, the title is the address, so the full URL goes underneath.
	const address = title === domain ? site.url.replace( /\/$/, '' ) : domain;
	const meta = detail
		? sprintf(
				/* translators: 1: A site address. 2: The site's host, or its status. */
				__( '%1$s · %2$s' ),
				address,
				detail
			)
		: address;
	return (
		<Item>
			<HStack spacing={ 3 } ref={ container }>
				<SiteScreenshot url={ site.url } alt="" compact decorative width={ 64 } height={ 36 } />
				<FlexBlock className="agency-site-wizard__site-text">
					<VStack spacing={ 0 }>
						<Text weight={ 500 } truncate numberOfLines={ 1 }>
							{ title }
						</Text>
						<Text variant="muted" truncate numberOfLines={ 1 }>
							{ meta }
						</Text>
					</VStack>
				</FlexBlock>
				{ action }
				{ onRemove && (
					<Button
						className="agency-site-wizard__site-remove"
						icon={ closeSmall }
						label={ sprintf(
							/* translators: %s is a site name. */
							__( 'Remove %s' ),
							title
						) }
						onClick={ onRemove }
						size="small"
						__next40pxDefaultSize
					/>
				) }
			</HStack>
		</Item>
	);
}
