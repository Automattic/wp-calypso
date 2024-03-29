import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { Button } from '@automattic/components';
import { isMobile } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { ResizableBox, Tooltip } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { Icon, lock } from '@wordpress/icons';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsGetAccessModal } from 'calypso/my-sites/patterns/components/get-access-modal';
import { getTracksPatternType } from '../../lib/get-tracks-pattern-type';
import type {
	Pattern,
	PatternGalleryProps,
	PatternTypeFilter,
} from 'calypso/my-sites/patterns/types';
import type { Dispatch, SetStateAction } from 'react';

import './style.scss';

export const DESKTOP_VIEWPORT_WIDTH = 1200;
export const ASPECT_RATIO = 7 / 4;

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
	category: string;
	className?: string;
	getPatternPermalink?: PatternGalleryProps[ 'getPatternPermalink' ];
	isResizable?: boolean;
	pattern: Pattern | null;
	patternTypeFilter: PatternTypeFilter;
	isGridView?: boolean;
	viewportWidth?: number;
};

function PatternPreviewFragment( {
	canCopy = true,
	category,
	className,
	getPatternPermalink = () => '',
	pattern,
	patternTypeFilter,
	isGridView,
	viewportWidth,
}: PatternPreviewProps ) {
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

	const titleTooltipText = isPermalinkCopied ? 'Copied link to pattern' : 'Copy link to pattern';

	let copyButtonText = isPreviewLarge ? 'Copy pattern' : 'Copy';

	if ( isPatternCopied ) {
		copyButtonText = isPreviewLarge ? 'Pattern copied!' : 'Copied';
	}

	useTimeoutToResetBoolean( isPermalinkCopied, setIsPermalinkCopied );
	useTimeoutToResetBoolean( isPatternCopied, setIsPatternCopied );

	useEffect( () => {
		ref.current?.dispatchEvent( new CustomEvent( 'patternPreviewResize', { bubbles: true } ) );
	}, [ nodeSize.width, nodeSize.height ] );

	// We deliberately use `window.scrollBy` instead of setting an ID attribute on the
	// `.pattern-preview` element to avoid a janky experience for users while the page is loading.
	// This way, the browser doesn't scroll down to the relevant patterns until patterns are mostly
	// finished loading.
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

			const stickyNav = document.querySelector( '.pattern-library__pill-navigation' );
			const stickyNavCoords = stickyNav?.getBoundingClientRect();
			const stickyNavHeight = stickyNavCoords && ! isMobile() ? stickyNavCoords.height : 0;

			const elementCoords = element.getBoundingClientRect();

			window.scrollBy( {
				behavior: 'smooth',
				top: elementCoords.top - stickyNavHeight - masterbarHeight - 16,
			} );
		}, 1000 );

		return () => {
			clearTimeout( timeoutId );
		};
	}, [ renderedPattern, idAttr ] );

	if ( ! pattern ) {
		return null;
	}

	// This handler will be used to fire each of the different 'Get Access'
	// events for logged out users: opening the modal, closing the modal,
	// signing up, and logging in. The handler will be passed the name of the
	// event to fire, and the event props will be the same for each.
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
			className={ classNames( 'pattern-preview', className, {
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
					minHeight={ nodeSize.width ? nodeSize.width / ASPECT_RATIO : undefined }
					patternId={ patternId }
					viewportWidth={ viewportWidth }
				/>
			</div>

			<div className="pattern-preview__header">
				<Tooltip delay={ 300 } placement="top" text={ titleTooltipText }>
					<ClipboardButton
						borderless
						className="pattern-preview__title"
						onCopy={ () => {
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
							setIsPatternCopied( true );
						} }
						text={ pattern?.html ?? '' }
						primary
					>
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
						<Icon height={ 18 } icon={ lock } width={ 18 } /> Get access
					</Button>
				) }
			</div>

			<PatternsGetAccessModal
				isOpen={ isAuthModalOpen }
				onClose={ () => setIsAuthModalOpen( false ) }
				tracksEventHandler={ recordGetAccessEvent }
			/>
		</div>
	);
}

export function PatternPreview( props: PatternPreviewProps ) {
	const { isResizable, pattern } = props;
	const isMobile = useMobileBreakpoint();

	if ( ! pattern ) {
		return null;
	}

	if ( ! isResizable || isMobile ) {
		return <PatternPreviewFragment { ...props } />;
	}

	return (
		<ResizableBox
			enable={ {
				top: false,
				right: true,
				bottom: false,
				left: false,
				topRight: false,
				bottomRight: false,
				bottomLeft: false,
				topLeft: false,
			} }
			handleWrapperClass="pattern-preview__resizer"
			minWidth={ 375 }
			maxWidth="100%"
		>
			<PatternPreviewFragment { ...props } />
		</ResizableBox>
	);
}
