import page from '@automattic/calypso-router';
import { formatNumber } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Notice,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	VisuallyHidden,
} from '@wordpress/components';
import { useResizeObserver, useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { desktop, external, mobile, tablet } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useDispatch } from 'calypso/state';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/actions';
import {
	activateRedesign,
	applyRedesign,
	currentBatch,
	errorCode,
	fetchPreview,
	fetchRedesign,
	generateRedesign,
	getCheckoutUrl,
	openRedesign,
	type Candidate,
	type Redesign,
} from './api';
import { SiteSkeleton } from './site-skeleton';

import './style.scss';

const POLL_MS = 3000;
// A beat with every preview on screen before the bar asks for a choice.
const SELECTION_BAR_DELAY_MS = 1500;
const POLLED_STATUSES = [ 'generating', 'applying' ];
// About two minutes of waiting for a purchase to reach the site after checkout.
const PURCHASE_WAIT_MS = 120000;

type Props = {
	siteId: number;
	siteSlug: string;
	redesignId: string | null;
	resume: boolean;
};

const redesignKey = ( siteId: number, id: string | null ) => [ 'site-redesign', siteId, id ];

const isWaitingForPurchase = ( redesign: Redesign | undefined, resume: boolean ) =>
	resume &&
	redesign?.status === 'preview_ready' &&
	!! redesign.pending_apply &&
	! redesign.eligibility.can_apply;

function httpUrl( url: string | undefined ): string | undefined {
	try {
		return url && [ 'http:', 'https:' ].includes( new URL( url ).protocol ) ? url : undefined;
	} catch {
		return undefined;
	}
}

const SITE_EDITOR_PATH = '/wp-admin/site-editor.php';

/**
 * The installed theme on the site's front end. The API's Live Preview link opens the Site Editor;
 * the same `wp_theme_preview` on the site's home shows the theme as visitors would, to whoever
 * may switch themes. Without the theme to preview, there is nothing honest to show.
 */
export function installedPreviewUrl( url: string | undefined ): string | undefined {
	const safe = httpUrl( url );
	if ( ! safe ) {
		return undefined;
	}
	const parsed = new URL( safe );
	if ( ! parsed.pathname.endsWith( SITE_EDITOR_PATH ) ) {
		return safe;
	}
	const theme = parsed.searchParams.get( 'wp_theme_preview' );
	if ( ! theme ) {
		return undefined;
	}
	const home = new URL( parsed.pathname.slice( 0, -SITE_EDITOR_PATH.length ) + '/', parsed.origin );
	home.searchParams.set( 'wp_theme_preview', theme );
	return home.toString();
}

function messageOf( error: unknown ): string {
	const message = ( error as { message?: unknown } | null )?.message;
	return typeof message === 'string' && message
		? message
		: __( 'Something went wrong. Please try again.' );
}

function applyStepLabel( step: string | undefined ): string {
	switch ( step ) {
		case 'awaiting_atomic':
			return __( 'Preparing your site. This can take a few minutes.' );
		case 'delivering':
			return __( 'Installing your new design…' );
		case 'activating':
			return __( 'Switching your site to the new design…' );
		default:
			return __( 'Getting your new design ready…' );
	}
}

type PreviewState = 'loading' | 'ready' | 'error';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// The layout viewport each preview document is rendered at before it is scaled to its card, so
// the design's own media queries see the device's real width.
const DEVICE_VIEWPORTS: Record< PreviewDevice, { width: number; height: number } > = {
	desktop: { width: 1280, height: 800 },
	tablet: { width: 768, height: 1024 },
	mobile: { width: 390, height: 844 },
};

function usePreviewDevice() {
	const isSmallViewport = useViewportMatch( 'small', '<' );
	const [ chosen, setChosen ] = useState< PreviewDevice | null >( null );
	return [ chosen ?? ( isSmallViewport ? 'mobile' : 'desktop' ), setChosen ] as const;
}

// The block editor's preview dropdown (@wordpress/editor PreviewDropdown), opening upward from the
// bar. Its rows are MenuItems rather than MenuItemsChoice, which can't show each device's icon.
function DeviceDropdown( {
	value,
	onChange,
}: {
	value: PreviewDevice;
	onChange: ( device: PreviewDevice ) => void;
} ) {
	const choices = [
		{ value: 'desktop' as const, label: __( 'Desktop' ), icon: desktop },
		{ value: 'tablet' as const, label: __( 'Tablet' ), icon: tablet },
		{ value: 'mobile' as const, label: __( 'Mobile' ), icon: mobile },
	];
	const current = choices.find( ( choice ) => choice.value === value ) ?? choices[ 0 ];
	return (
		<DropdownMenu
			icon={ current.icon }
			label={ sprintf(
				/* translators: %s is the device the designs are previewed on, like "Desktop". */
				__( 'Preview: %s' ),
				current.label
			) }
			// Shifts back on screen where the bar puts the button near an edge.
			popoverProps={ {
				placement: 'top-end',
				shift: true,
				className: 'site-redesign__device-menu',
			} }
			toggleProps={ { __next40pxDefaultSize: true } }
			menuProps={ { 'aria-label': __( 'Preview options' ) } }
		>
			{ ( { onClose } ) => (
				<MenuGroup>
					{ choices.map( ( choice ) => (
						<MenuItem
							key={ choice.value }
							role="menuitemradio"
							icon={ choice.icon }
							iconPosition="left"
							isSelected={ choice.value === value }
							onClick={ () => {
								onClose();
								if ( choice.value !== value ) {
									onChange( choice.value );
								}
							} }
						>
							{ choice.label }
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

function frameVars( device: PreviewDevice ) {
	return {
		'--site-redesign-frame-width': DEVICE_VIEWPORTS[ device ].width,
		'--site-redesign-frame-height': DEVICE_VIEWPORTS[ device ].height,
	} as CSSProperties;
}

function gridProps( device: PreviewDevice ) {
	return {
		className: clsx( 'site-redesign__grid', `is-${ device }` ),
		style: frameVars( device ),
	};
}

// Measures a thumbnail so the frame inside can scale its device viewport to it.
function useFrameScale() {
	return useResizeObserver< HTMLDivElement >( ( entries ) => {
		const entry = entries[ 0 ];
		if ( entry && entry.contentRect.width > 0 ) {
			( entry.target as HTMLElement ).style.setProperty(
				'--site-redesign-thumbnail-width',
				String( entry.contentRect.width )
			);
		}
	} );
}

function CandidatePreview( {
	siteId,
	redesignId,
	candidate,
	index,
	onStateChange,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
	onStateChange: ( generationId: string, state: PreviewState ) => void;
} ) {
	const preview = useQuery( {
		queryKey: [ 'site-redesign-preview', siteId, redesignId, candidate.id ],
		queryFn: () => fetchPreview( siteId, redesignId, candidate.id ),
		staleTime: Infinity,
	} );
	const [ loaded, setLoaded ] = useState( false );
	let state: PreviewState = loaded ? 'ready' : 'loading';
	if ( preview.isError ) {
		state = 'error';
	}
	useEffect( () => {
		onStateChange( candidate.id, state );
	}, [ candidate.id, state, onStateChange ] );
	if ( preview.isError ) {
		return <Text>{ messageOf( preview.error ) }</Text>;
	}
	return (
		<>
			{ ! loaded && <SiteSkeleton className="site-redesign__skeleton" /> }
			{ preview.data && (
				<iframe
					className={ clsx( 'site-redesign__frame', { 'is-loaded': loaded } ) }
					title={ sprintf(
						/* translators: %s is the design's position in the list. */
						__( 'Preview of design %s' ),
						formatNumber( index + 1 )
					) }
					// Opaque origin: the server's own script may run, nothing in it can reach Calypso.
					sandbox="allow-scripts"
					srcDoc={ preview.data.html }
					tabIndex={ -1 }
					onLoad={ () => setLoaded( true ) }
				/>
			) }
		</>
	);
}

// Holds the places the designs will fill while there are none to show yet.
function CandidateSlots( { device }: { device: PreviewDevice } ) {
	return (
		<div { ...gridProps( device ) } aria-hidden="true">
			{ Array.from( { length: 4 }, ( _, index ) => (
				<VStack key={ index } className="site-redesign__candidate" spacing={ 3 }>
					<div className="site-redesign__thumbnail">
						<SiteSkeleton className="site-redesign__skeleton" />
					</div>
					<div className="site-redesign__caption-skeleton" />
				</VStack>
			) ) }
		</div>
	);
}

// The installed theme on the site itself, through the Live Preview URL the API hands back.
function InstalledPreview( { url, device }: { url: string | undefined; device: PreviewDevice } ) {
	const observeThumbnail = useFrameScale();
	const [ loaded, setLoaded ] = useState( false );
	if ( ! url ) {
		return (
			<Text>
				{ __( 'The preview isn’t available right now. You can still switch to your new design.' ) }
			</Text>
		);
	}
	return (
		<VStack className="site-redesign__installed" spacing={ 4 } alignment="center">
			<div
				className={ clsx( 'site-redesign__installed-frame', `is-${ device }` ) }
				style={ frameVars( device ) }
			>
				<div className="site-redesign__thumbnail" ref={ observeThumbnail }>
					{ ! loaded && <SiteSkeleton className="site-redesign__skeleton" /> }
					<iframe
						className={ clsx( 'site-redesign__frame', 'is-live', { 'is-loaded': loaded } ) }
						title={ __( 'Preview of your new design' ) }
						src={ url }
						onLoad={ () => setLoaded( true ) }
					/>
				</div>
			</div>
		</VStack>
	);
}

function readiness(
	candidate: Candidate,
	preview: PreviewState | undefined,
	sessionReady: boolean,
	choosing: boolean
): string {
	switch ( candidate.status ) {
		case 'failed':
			return __( 'Couldn’t be made' );
		case 'queued':
		case 'running':
			return __( 'Still being made' );
	}
	if ( preview === 'error' ) {
		return __( 'The preview couldn’t load' );
	}
	if ( preview !== 'ready' ) {
		return __( 'Loading the preview…' );
	}
	if ( choosing ) {
		return __( 'Choosing this design…' );
	}
	return sessionReady
		? __( 'Ready to choose' )
		: __( 'Ready. You can choose once every design is done.' );
}

function designLabel( index: number, count: number ): string {
	return sprintf(
		/* translators: %1$s is the design's position, %2$s how many designs there are. */
		__( 'Design %1$s of %2$s' ),
		formatNumber( index + 1 ),
		formatNumber( count )
	);
}

function CandidateCard( {
	siteId,
	redesignId,
	candidate,
	index,
	count,
	isSelected,
	isLocked,
	onSelect,
	onPreviewStateChange,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
	count: number;
	isSelected: boolean;
	isLocked: boolean;
	onSelect: () => void;
	onPreviewStateChange: ( generationId: string, state: PreviewState ) => void;
} ) {
	const observeThumbnail = useFrameScale();
	return (
		<VStack
			className={ clsx( 'site-redesign__candidate', { 'is-selected': isSelected } ) }
			spacing={ 3 }
		>
			<div className="site-redesign__thumbnail" ref={ observeThumbnail }>
				{ candidate.status === 'succeeded' && (
					<CandidatePreview
						siteId={ siteId }
						redesignId={ redesignId }
						candidate={ candidate }
						index={ index }
						onStateChange={ onPreviewStateChange }
					/>
				) }
				{ ( candidate.status === 'queued' || candidate.status === 'running' ) && (
					<SiteSkeleton className="site-redesign__skeleton" />
				) }
				{ candidate.status === 'failed' && (
					<Text>{ candidate.error?.message ?? __( 'This design could not be made.' ) }</Text>
				) }
			</div>
			<Text weight={ 500 }>
				{ sprintf(
					/* translators: %s is the design's position in the list. */
					__( 'Design %s' ),
					formatNumber( index + 1 )
				) }
			</Text>
			{ /* Covers the whole card; the preview iframe can't sit inside a button. */ }
			<button
				type="button"
				className="site-redesign__select"
				aria-label={ designLabel( index, count ) }
				aria-pressed={ isSelected }
				disabled={ isLocked || candidate.status !== 'succeeded' }
				onClick={ onSelect }
			/>
		</VStack>
	);
}

export default function SiteRedesign( { siteId, siteSlug, redesignId, resume }: Props ) {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const [ notice, setNotice ] = useState< string | null >( null );
	const [ purchaseTimedOut, setPurchaseTimedOut ] = useState( false );
	const resumed = useRef( false );
	const redirected = useRef( false );
	const started = useRef< string | null >( null );
	// By id, not position: polling can reorder or drop candidates under the selection.
	const [ selectedId, setSelectedId ] = useState< string | null >( null );
	const [ device, setDevice ] = usePreviewDevice();
	const deviceChosen = useRef( false );
	const chooseDevice = ( next: PreviewDevice ) => {
		deviceChosen.current = true;
		setDevice( next );
	};
	// Back to the top once the grid has its new shape, so a new device starts from the first designs.
	// Only for a device the user picked: a resize that changes the default keeps the page where it is.
	useLayoutEffect( () => {
		if ( deviceChosen.current ) {
			deviceChosen.current = false;
			window.scrollTo( { top: 0, left: 0, behavior: 'instant' } );
		}
	}, [ device ] );
	const [ previewStates, setPreviewStates ] = useState< Record< string, PreviewState > >( {} );
	const onPreviewStateChange = useCallback( ( generationId: string, state: PreviewState ) => {
		setPreviewStates( ( states ) =>
			states[ generationId ] === state ? states : { ...states, [ generationId ]: state }
		);
	}, [] );

	const redesignQuery = useQuery( {
		queryKey: redesignKey( siteId, redesignId ),
		queryFn: () => fetchRedesign( siteId, redesignId as string ),
		enabled: !! redesignId,
		staleTime: POLL_MS,
		refetchInterval: ( query ) => {
			const data = query.state.data;
			if ( POLLED_STATUSES.includes( data?.status ?? '' ) ) {
				return POLL_MS;
			}
			return isWaitingForPurchase( data, resume ) && ! purchaseTimedOut ? POLL_MS : false;
		},
	} );
	const redesign = redesignQuery.data;
	const waitingForPurchase = isWaitingForPurchase( redesign, resume );
	useEffect( () => {
		setPurchaseTimedOut( false );
		if ( ! waitingForPurchase ) {
			return;
		}
		const timeout = window.setTimeout( () => setPurchaseTimedOut( true ), PURCHASE_WAIT_MS );
		return () => window.clearTimeout( timeout );
	}, [ waitingForPurchase, siteId, redesignId ] );

	useLayoutEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	// A response belongs to the site and session that asked for it. Without this, a slow one
	// could be filed under another site's key or send the user back to a page they left.
	const mounted = useRef( true );
	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, [] );
	const current = useRef( { siteId, siteSlug, redesignId } );
	current.current = { siteId, siteSlug, redesignId };
	const origin = () => ( { siteId, siteSlug, redesignId } );
	type Origin = ReturnType< typeof origin >;
	const isCurrent = ( from: Origin | undefined ) =>
		!! from &&
		mounted.current &&
		from.siteId === current.current.siteId &&
		from.siteSlug === current.current.siteSlug &&
		from.redesignId === current.current.redesignId;

	const store = ( next: Redesign, _variables: unknown, from: Origin | undefined ) => {
		if ( ! from ) {
			return;
		}
		queryClient.setQueryData( redesignKey( from.siteId, next.id ), next );
		if ( isCurrent( from ) && next.id !== from.redesignId ) {
			page.replace( addQueryArgs( `/site-redesign/${ from.siteSlug }`, { redesign: next.id } ) );
		}
	};

	const noticeHandlers = {
		onMutate: () => {
			setNotice( null );
			return origin();
		},
		onError: ( error: unknown, _variables: unknown, from: Origin | undefined ) => {
			if ( isCurrent( from ) ) {
				setNotice( messageOf( error ) );
			}
		},
	};

	const start = useMutation( {
		mutationFn: async ( retryFailed: boolean ) => {
			const open = redesignId
				? await fetchRedesign( siteId, redesignId )
				: await openRedesign( siteId );
			const needsDesigns =
				( open.status === 'interview' && open.candidates.length === 0 ) ||
				( retryFailed && open.status === 'failed' );
			if ( ! needsDesigns || ! open.eligibility.can_preview ) {
				return open;
			}
			try {
				return await generateRedesign( siteId, open.id );
			} catch ( error ) {
				if ( errorCode( error ) === 'site_redesign_busy' ) {
					return fetchRedesign( siteId, open.id );
				}
				throw error;
			}
		},
		...noticeHandlers,
		onSuccess: store,
	} );

	const { mutate: startDesigns } = start;
	useEffect( () => {
		const key = `${ siteId }:${ redesignId ?? '' }`;
		if (
			! resume &&
			started.current !== key &&
			( ! redesignId ||
				( redesign?.status === 'interview' &&
					redesign.candidates.length === 0 &&
					redesign.eligibility.can_preview ) )
		) {
			started.current = key;
			startDesigns( false );
		}
	}, [ siteId, redesignId, redesign, resume, startDesigns ] );

	const choose = useMutation( {
		mutationFn: ( generationId: string ) =>
			applyRedesign( siteId, redesign?.id as string, generationId ),
		onMutate: noticeHandlers.onMutate,
		onSuccess: store,
		onError: ( error, _variables, from ) => {
			if ( ! isCurrent( from ) ) {
				return;
			}
			const checkoutUrl = getCheckoutUrl( error );
			if ( checkoutUrl ) {
				page( checkoutUrl );
				return;
			}
			if ( errorCode( error ) === 'site_redesign_busy' ) {
				// Back from checkout, the purchase listener may have started the apply first.
				redesignQuery.refetch();
				return;
			}
			setNotice( messageOf( error ) );
		},
	} );

	const { mutate: chooseCandidate } = choose;

	const activate = useMutation< Redesign, unknown, void, Origin | undefined >( {
		mutationFn: () => activateRedesign( siteId, redesign?.id as string ),
		...noticeHandlers,
		onSuccess: store,
	} );

	// Back from checkout: the server keeps the choice in `pending_apply` and usually starts the
	// apply on its own after the purchase. Start it here only if it hasn't.
	useEffect( () => {
		if (
			resume &&
			! resumed.current &&
			redesign?.status === 'preview_ready' &&
			redesign.pending_apply &&
			redesign.eligibility.can_apply
		) {
			resumed.current = true;
			chooseCandidate( redesign.pending_apply );
		}
	}, [ resume, redesign, chooseCandidate ] );

	const showsDesigns =
		!! redesign &&
		[ 'generating', 'preview_ready' ].includes( redesign.status ) &&
		! isWaitingForPurchase( redesign, resume );
	const batch = redesign ? currentBatch( redesign ) : [];
	const selectedIndex = batch.findIndex( ( candidate ) => candidate.id === selectedId );
	const selected = selectedIndex >= 0 ? batch[ selectedIndex ] : undefined;
	// The bar arrives once there is something to choose from: every design made, and every
	// preview that could load on screen. A preview that failed stays failed and doesn't hold it back.
	const isSelectionReady =
		redesign?.status === 'preview_ready' &&
		batch.some( ( candidate ) => previewStates[ candidate.id ] === 'ready' ) &&
		batch.every(
			( candidate ) =>
				candidate.status !== 'succeeded' ||
				previewStates[ candidate.id ] === 'ready' ||
				previewStates[ candidate.id ] === 'error'
		);
	const isSelectionBarDue = showsDesigns && isSelectionReady;
	const [ selectionBarShown, setSelectionBarShown ] = useState( false );
	useEffect( () => {
		if ( ! isSelectionBarDue ) {
			setSelectionBarShown( false );
			return;
		}
		const timer = setTimeout( () => setSelectionBarShown( true ), SELECTION_BAR_DELAY_MS );
		return () => clearTimeout( timer );
	}, [ isSelectionBarDue ] );
	const canChooseSelected =
		redesign?.status === 'preview_ready' &&
		selected?.status === 'succeeded' &&
		previewStates[ selected.id ] === 'ready' &&
		! choose.isPending;

	const title = __( 'Redesign your site' );
	const isInstalled = redesign?.status === 'installed';
	const installedUrl = isInstalled
		? installedPreviewUrl( redesign?.applied?.preview_url )
		: undefined;
	const heading = isInstalled ? (
		<Step.Heading
			text={ __( 'Your new design is ready' ) }
			subText={ __(
				'Switch to it when you’re ready. Your site keeps its current design until then.'
			) }
		/>
	) : (
		<Step.Heading
			text={ title }
			subText={ __( 'Pick a new design made from the content already on your site.' ) }
		/>
	);

	// Live: the site's own theme list takes over, once.
	useEffect( () => {
		if ( redesign?.status === 'applied' && ! redirected.current ) {
			redirected.current = true;
			page.replace( `/themes/${ siteSlug }` );
		}
	}, [ redesign?.status, siteSlug ] );

	const retryButton = (
		<Button
			__next40pxDefaultSize
			variant="primary"
			isBusy={ start.isPending }
			disabled={ start.isPending }
			onClick={ () => startDesigns( true ) }
		>
			{ __( 'Retry' ) }
		</Button>
	);
	const opening = (
		<VStack spacing={ 4 }>
			<Text role="status">{ __( 'Getting your designs ready…' ) }</Text>
			<CandidateSlots device={ device } />
		</VStack>
	);

	const renderBody = () => {
		if ( ! redesignId ) {
			return start.isError ? retryButton : opening;
		}
		if ( ! redesign ) {
			if ( redesignQuery.isError ) {
				return <Text>{ messageOf( redesignQuery.error ) }</Text>;
			}
			// Back from checkout the page moves on to the purchase, not to the designs.
			return resume ? <Spinner /> : opening;
		}

		if ( waitingForPurchase ) {
			return ! purchaseTimedOut ? (
				<HStack justify="flex-start">
					<Spinner />
					<Text>{ __( 'Finishing your purchase…' ) }</Text>
				</HStack>
			) : (
				<Text>
					{ __(
						'Your purchase is taking longer than usual. Reload this page in a few minutes to see your new design.'
					) }
				</Text>
			);
		}

		switch ( redesign.status ) {
			case 'applying':
				return (
					<HStack justify="flex-start">
						<Spinner />
						<Text>{ applyStepLabel( redesign.apply?.status ) }</Text>
					</HStack>
				);
			case 'installed':
				return <InstalledPreview url={ installedUrl } device={ device } />;
			case 'applied':
				// On its way to the theme list.
				return null;
			case 'interview':
				if ( ! redesign.eligibility.can_preview ) {
					return <Text>{ __( 'Design previews are not available for this site.' ) }</Text>;
				}
				return start.isError ? retryButton : opening;
			case 'failed':
				return (
					<VStack alignment="topLeft" spacing={ 4 }>
						{ redesign.status === 'failed' && (
							<Text>{ __( 'We couldn’t make designs for your site this time.' ) }</Text>
						) }
						{ retryButton }
					</VStack>
				);
			case 'rolled_back':
				return <Text>{ __( 'This redesign was rolled back.' ) }</Text>;
			case 'superseded':
				return <Text>{ __( 'A newer redesign replaced this one.' ) }</Text>;
		}

		return (
			<VStack spacing={ 4 }>
				{ redesign.status === 'generating' && (
					<VisuallyHidden role="status">
						{ __( 'Making new designs from your content…' ) }
					</VisuallyHidden>
				) }
				<div { ...gridProps( device ) }>
					{ batch.map( ( candidate, index ) => (
						<CandidateCard
							key={ candidate.id }
							siteId={ siteId }
							redesignId={ redesign.id }
							candidate={ candidate }
							index={ index }
							count={ batch.length }
							isSelected={ candidate.id === selected?.id }
							// The bar names the design being chosen; it can't move mid-request.
							isLocked={ choose.isPending }
							onSelect={ () => setSelectedId( candidate.id ) }
							onPreviewStateChange={ onPreviewStateChange }
						/>
					) ) }
				</div>
			</VStack>
		);
	};

	const barTitle = isInstalled
		? __( 'Your chosen design' )
		: ( selected && designLabel( selectedIndex, batch.length ) ) || __( 'Select a design' );
	let barStatus: string = __( 'Nothing selected yet' );
	if ( isInstalled ) {
		barStatus = activate.isPending
			? __( 'Switching your site to the new design…' )
			: __( 'Installed, not yet live' );
	} else if ( selected ) {
		barStatus = readiness(
			selected,
			previewStates[ selected.id ],
			redesign?.status === 'preview_ready',
			choose.isPending
		);
	}
	const barAction = isInstalled ? (
		<Step.PrimaryButton
			disabled={ activate.isPending }
			isBusy={ activate.isPending }
			onClick={ () => activate.mutate() }
		>
			{ __( 'Use this design' ) }
		</Step.PrimaryButton>
	) : (
		<Step.PrimaryButton
			disabled={ ! canChooseSelected }
			isBusy={ choose.isPending }
			onClick={ () => selected && chooseCandidate( selected.id ) }
		>
			{ __( 'Choose this one' ) }
		</Step.PrimaryButton>
	);
	const bottomBar = () => (
		<Step.StickyBottomBar
			leftElement={
				<VStack spacing={ 0 } aria-live="polite">
					<Text weight={ 600 }>{ barTitle }</Text>
					<Text variant="muted">{ barStatus }</Text>
				</VStack>
			}
			rightElement={
				<HStack spacing={ 4 } expanded={ false }>
					<HStack spacing={ 1 } expanded={ false }>
						{ /* The block editor's view-site button: the same theme preview, on its own. */ }
						{ installedUrl && (
							<Button
								__next40pxDefaultSize
								className="site-redesign__open-preview"
								icon={ external }
								label={ __( 'Open preview in a new tab' ) }
								href={ installedUrl }
								target="_blank"
								rel="noopener noreferrer"
							/>
						) }
						<DeviceDropdown value={ device } onChange={ chooseDevice } />
					</HStack>
					{ barAction }
				</HStack>
			}
		/>
	);

	// The stretches with nothing to choose, only waiting: the same full-page loading as the
	// onboarding steps that wait on a site, titled with what is happening right now.
	let waitingTitle: string | undefined;
	let isWaiting = false;
	if ( redesignId && ! redesign && ! redesignQuery.isError && resume ) {
		isWaiting = true;
	} else if ( waitingForPurchase && ! purchaseTimedOut ) {
		isWaiting = true;
		waitingTitle = __( 'Finishing your purchase…' );
	} else if ( redesign?.status === 'applying' ) {
		isWaiting = true;
		waitingTitle = applyStepLabel( redesign.apply?.status );
	} else if ( redesign?.status === 'applied' ) {
		isWaiting = true;
	}
	if ( isWaiting && ! notice ) {
		return (
			<>
				<DocumentHead title={ title } />
				<Step.Loading title={ waitingTitle && <span role="status">{ waitingTitle }</span> } />
			</>
		);
	}

	const applyError = redesign?.apply?.error;
	return (
		<>
			<DocumentHead title={ title } />
			<Step.WideLayout
				className="site-redesign"
				topBar={ <Step.TopBar /> }
				heading={ heading }
				stickyBottomBar={
					( isSelectionBarDue && selectionBarShown ) || isInstalled ? bottomBar : undefined
				}
			>
				<VStack spacing={ 4 }>
					{ notice && (
						<Notice status="error" isDismissible={ false }>
							{ notice }
						</Notice>
					) }
					{ applyError && redesign?.status === 'installed' && (
						<Notice status="warning" isDismissible={ false }>
							{ sprintf(
								/* translators: %s is the reason the switch failed. */
								__( 'We couldn’t switch to the new design, so your site kept its current one. %s' ),
								applyError.message
							) }
						</Notice>
					) }
					{ applyError && redesign?.status === 'preview_ready' && (
						<Notice status="error" isDismissible={ false }>
							{ applyError.message }
						</Notice>
					) }
					{ renderBody() }
				</VStack>
			</Step.WideLayout>
		</>
	);
}
