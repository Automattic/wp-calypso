import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { Button } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { ResizableBox, Tooltip } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { Icon, check, copy, lock } from '@wordpress/icons';
import clsx from 'clsx';
import { useRtl, useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsGetAccessModal } from 'calypso/my-sites/patterns/components/get-access-modal';
import { patternFiltersClassName } from 'calypso/my-sites/patterns/components/pattern-library';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { useRecordPatternsEvent } from 'calypso/my-sites/patterns/hooks/use-record-patterns-event';
import { encodePatternId } from 'calypso/my-sites/patterns/lib/encode-pattern-id';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import type { Pattern, PatternGalleryProps } from 'calypso/my-sites/patterns/types';
import type { Dispatch, SetStateAction } from 'react';

import './style.scss';

export const GRID_VIEW_VIEWPORT_WIDTH = 1200;
export const ASPECT_RATIO = 7 / 4;

// This style is injected into pattern preview iframes to prevent users from navigating away from
// the pattern preview page and from submitting forms.
const noClickStyle = {
	css: 'a[href], button, input, textarea { pointer-events: none; }',
	isGlobalStyles: true,
};

// Firefox and Safari have trouble rendering elements in iframes with `writing-mode` styles. This
// hacky script is injected into pattern preview iframes to force rerender those elements.
function forceRedraw() {
	const elements = document.querySelectorAll< HTMLElement >( '[style*="writing-mode"]' );

	elements.forEach( ( element ) => {
		element.style.display = 'none';
	} );

	setTimeout( () => {
		elements.forEach( ( element ) => {
			element.style.removeProperty( 'display' );
		} );
	}, 200 );
}

const redrawScript = `
<script defer>
(${ forceRedraw.toString() })();
</script>
`;

// Abstraction for resetting `isPatternCopied` and `isPermalinkCopied` after a given delay
function useTimeoutToResetBoolean(
	value: boolean,
	setter: Dispatch< SetStateAction< boolean > >,
	timeout = 4500
) {
	useEffect( () => {
		if ( ! value ) {
			return;
		}

		const timeoutId = setTimeout( () => {
			setter( false );
		}, timeout );

		return () => {
			clearTimeout( timeoutId );
		};
	}, [ value ] );
}

type PatternPreviewProps = {
	canCopy?: boolean;
	className?: string;
	getPatternPermalink?: PatternGalleryProps[ 'getPatternPermalink' ];
	isResizable?: boolean;
	pattern: Pattern | null;
	viewportWidth?: number;
};

function PatternPreviewFragment( {
	canCopy = true,
	className,
	getPatternPermalink = () => '',
	pattern,
	viewportWidth: fixedViewportWidth,
}: PatternPreviewProps ) {
	const { category, patternTypeFilter, isGridView } = usePatternsContext();

	const { recordPatternsEvent } = useRecordPatternsEvent();
	const ref = useRef< HTMLDivElement >( null );
	const hasScrolledToAnchorRef = useRef< boolean >( false );

	const [ isPermalinkCopied, setIsPermalinkCopied ] = useState( false );
	const [ isPatternCopied, setIsPatternCopied ] = useState( false );

	const idAttr = `pattern-${ pattern?.ID }`;

	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();
	const [ isAuthModalOpen, setIsAuthModalOpen ] = useState( false );

	const isPreviewLarge = nodeSize?.width ? nodeSize.width > 960 : true;

	let viewportWidth: number | undefined = undefined;

	if ( fixedViewportWidth ) {
		viewportWidth = fixedViewportWidth;
	} else if ( nodeSize.width ) {
		viewportWidth = nodeSize.width * 1.16;
	}

	const translate = useTranslate();

	const titleTooltipText = isPermalinkCopied
		? translate( 'Copied link to pattern', {
				comment: 'Tooltip text in Pattern Library for when the user just clicked a button',
				textOnly: true,
		  } )
		: translate( 'Copy link to pattern', {
				comment: 'Tooltip text in Pattern Library',
				textOnly: true,
		  } );

	let copyButtonText = isPreviewLarge
		? translate( 'Copy pattern', {
				comment: 'Button label for copying a pattern',
				textOnly: true,
		  } )
		: translate( 'Copy', {
				comment: 'Button label for copying a pattern',
				textOnly: true,
		  } );

	if ( isPatternCopied ) {
		copyButtonText = isPreviewLarge
			? translate( 'Pattern copied', {
					comment: 'Button label for when a pattern was just copied',
					textOnly: true,
			  } )
			: translate( 'Copied', {
					comment: 'Button label for when a pattern was just copied',
					textOnly: true,
			  } );
	}

	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );
	const recordCopyEvent = ( tracksEventName: string ) => {
		recordTracksEvent( tracksEventName, {
			name: pattern?.name,
			category,
			type: getTracksPatternType( patternTypeFilter ),
			user_is_dev_account: isDevAccount ? '1' : '0',
			view: isGridView ? 'grid' : 'list',
		} );
	};

	useTimeoutToResetBoolean( isPermalinkCopied, setIsPermalinkCopied );
	useTimeoutToResetBoolean( isPatternCopied, setIsPatternCopied );

	useEffect( () => {
		ref.current?.dispatchEvent( new CustomEvent( 'patternPreviewResize', { bubbles: true } ) );
	}, [ nodeSize.width, nodeSize.height ] );

	// When a URL with a single-pattern hash is loaded, scroll to that pattern preview. We use
	// `window.scrollBy` instead of setting an ID attribute on the relevant pattern preview to avoid
	// a janky experience for users while the page is loading. This way, the browser doesn't scroll
	// down to the relevant patterns until patterns are mostly finished loading.
	useEffect( () => {
		if (
			window.location.hash !== `#${ idAttr }` ||
			hasScrolledToAnchorRef.current ||
			! ref.current
		) {
			return;
		}

		const element = ref.current;

		const timeoutId = setTimeout( function () {
			hasScrolledToAnchorRef.current = true;

			const masterbarHeightRaw = getComputedStyle( document.documentElement ).getPropertyValue(
				'--masterbar-height'
			);
			const masterbarHeight = /^\d+px$/.test( masterbarHeightRaw )
				? parseInt( masterbarHeightRaw )
				: 0;

			const stickyNav = document.querySelector( `.${ patternFiltersClassName }` );
			const stickyNavCoords = stickyNav?.getBoundingClientRect();
			const stickyNavHeight = stickyNavCoords && ! isMobile() ? stickyNavCoords.height : 0;

			const elementCoords = element.getBoundingClientRect();

			const EXTRA_VERTICAL_MARGIN = 16;

			// We deliberately avoid smooth scrolling, since this will trigger lazy loading on the
			// iframes above the target, potentially causing the layout to shift, which suddenly
			// makes the scroll target incorrect
			window.scrollBy( {
				top: elementCoords.top - stickyNavHeight - masterbarHeight - EXTRA_VERTICAL_MARGIN,
			} );
		}, 1000 );

		return () => {
			clearTimeout( timeoutId );
		};
	}, [ renderedPattern, idAttr ] );

	// When an iframe loses focus, browsers will scroll them back into view. This behavior can be
	// annoying and make for a glitchy impression. This callback continuously stores the latest
	// window scroll position and restores it just after this preview iframe loses focus
	useEffect( () => {
		const iframe = ref.current?.querySelector( 'iframe' );

		if ( ! iframe ) {
			return;
		}

		let lastScrollPosition = window.scrollY;

		function onWindowScroll() {
			lastScrollPosition = window.scrollY;
		}

		function onIframeBlur() {
			const storedLastScrollPosition = lastScrollPosition;

			requestAnimationFrame( () => {
				window.scrollTo( { top: storedLastScrollPosition } );
			} );
		}

		window.addEventListener( 'scroll', onWindowScroll, { passive: true } );
		iframe.contentWindow?.addEventListener( 'blur', onIframeBlur );

		return () => {
			window.removeEventListener( 'scroll', onWindowScroll );
			iframe.contentWindow?.removeEventListener( 'blur', onIframeBlur );
		};
	} );

	// This fetches forms and adds a listener that disables submission
	useEffect( () => {
		const iframe = ref.current?.querySelector( 'iframe' );

		if ( ! iframe?.contentDocument ) {
			return;
		}

		const forms = iframe.contentDocument.querySelectorAll( 'form' );

		if ( ! forms.length ) {
			return;
		}

		const onFormSubmit = ( event: SubmitEvent ) => event.preventDefault();

		forms.forEach( ( form ) => form.addEventListener( 'submit', onFormSubmit ) );

		return () => {
			forms.forEach( ( form ) => form.removeEventListener( 'submit', onFormSubmit ) );
		};
	} );

	if ( ! pattern ) {
		return null;
	}

	const recordGetAccessEvent = ( tracksEventName: string ) => {
		recordTracksEvent( tracksEventName, {
			name: pattern.name,
			category,
			type: getTracksPatternType( patternTypeFilter ),
			view: isGridView ? 'grid' : 'list',
		} );
	};

	return (
		<div
			className={ clsx( 'pattern-preview', className, {
				'is-loading': ! renderedPattern,
				// For some reason, the CSS `:target` selector has trouble with the transition from
				// SSR markup to client-side React code, which is why we need the `is-targeted` class
				'is-targeted': window.location.hash === `#${ idAttr }`,
			} ) }
			ref={ ref }
		>
			{ resizeObserver }

			<div className="pattern-preview__renderer">
				<PatternRenderer
					maxHeight="none"
					minHeight={ nodeSize.width ? nodeSize.width / ASPECT_RATIO : undefined }
					patternId={ patternId }
					scripts={ redrawScript }
					styles={ [ noClickStyle ] }
					viewportWidth={ viewportWidth }
				/>
			</div>

			<div className="pattern-preview__header">
				<Tooltip delay={ 300 } placement="top" text={ titleTooltipText }>
					<ClipboardButton
						borderless
						className="pattern-preview__title"
						onCopy={ () => {
							recordPatternsEvent( 'calypso_pattern_library_permalink_copy', {
								name: pattern.name,
							} );
							setIsPermalinkCopied( true );
						} }
						text={ getPatternPermalink( pattern ) }
						transparent
					>
						{ pattern.title }
					</ClipboardButton>
				</Tooltip>

				{ canCopy && (
					<ClipboardButton
						className="pattern-preview__copy"
						onCopy={ () => {
							recordCopyEvent( 'calypso_pattern_library_copy' );
							setIsPatternCopied( true );
						} }
						text={ pattern?.html ?? '' }
						primary
					>
						<Icon height={ 18 } icon={ isPatternCopied ? check : copy } width={ 18 } />{ ' ' }
						{ copyButtonText }
					</ClipboardButton>
				) }

				{ ! canCopy && (
					<Button
						className="pattern-preview__get-access"
						onClick={ () => {
							setIsAuthModalOpen( true );
							recordGetAccessEvent( 'calypso_pattern_library_get_access' );
						} }
						transparent
					>
						<Icon height={ 18 } icon={ lock } width={ 18 } />{ ' ' }
						{ translate( 'Get access', {
							comment:
								'Button label shown when logged-out users need to sign up to be able to use a pattern',
						} ) }
					</Button>
				) }
			</div>

			<PatternsGetAccessModal
				isOpen={ isAuthModalOpen }
				onClose={ () => setIsAuthModalOpen( false ) }
				pattern={ pattern }
				tracksEventHandler={ recordGetAccessEvent }
			/>
		</div>
	);
}

export function PatternPreview( props: PatternPreviewProps ) {
	const { isResizable, pattern } = props;
	const { category, patternTypeFilter } = usePatternsContext();

	const isMobile = useMobileBreakpoint();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );
	const isRtl = useRtl();

	if ( ! pattern ) {
		return null;
	}

	if ( ! isResizable || isMobile ) {
		return <PatternPreviewFragment { ...props } />;
	}

	const recordResizeEvent = ( tracksEventName: string ) => {
		recordTracksEvent( tracksEventName, {
			name: pattern?.name,
			category,
			type: getTracksPatternType( patternTypeFilter ),
			is_logged_in: isLoggedIn,
			user_is_dev_account: isDevAccount ? '1' : '0',
		} );
	};

	return (
		<ResizableBox
			enable={ {
				top: false,
				right: ! isRtl,
				bottom: false,
				left: isRtl,
				topRight: false,
				bottomRight: false,
				bottomLeft: false,
				topLeft: false,
			} }
			handleWrapperClass="pattern-preview__resizer"
			minWidth={ 335 }
			maxWidth="100%"
			onResizeStop={ () => {
				recordResizeEvent( 'calypso_pattern_library_resize' );
			} }
		>
			<PatternPreviewFragment { ...props } />
		</ResizableBox>
	);
}
