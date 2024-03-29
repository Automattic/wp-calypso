import { PatternRenderer } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { ResizableBox, Tooltip } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { Icon, lock } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PatternsGetAccessModal } from 'calypso/my-sites/patterns/components/get-access-modal';
import { getTracksPatternType } from 'calypso/my-sites/patterns/lib/get-tracks-pattern-type';
import { PatternTypeFilter, Pattern, PatternGalleryProps } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
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
	const [ isPermalinkCopied, setIsPermalinkCopied ] = useState( false );
	const [ isPatternCopied, setIsPatternCopied ] = useState( false );

	const idAttr = `pattern-${ pattern?.ID }`;

	const { renderedPatterns } = usePatternsRendererContext();
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];
	const [ resizeObserver, nodeSize ] = useResizeObserver();
	const [ isAuthModalOpen, setIsAuthModalOpen ] = useState( false );

	const isPreviewLarge = nodeSize?.width ? nodeSize.width > 960 : true;

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
			? translate( 'Pattern copied!', {
					comment: 'Button label for when a pattern was just copied',
					textOnly: true,
			  } )
			: translate( 'Copied', {
					comment: 'Button label for when a pattern was just copied',
					textOnly: true,
			  } );
	}

	useTimeoutToResetBoolean( isPermalinkCopied, setIsPermalinkCopied );
	useTimeoutToResetBoolean( isPatternCopied, setIsPatternCopied );

	useEffect( () => {
		ref.current?.dispatchEvent( new CustomEvent( 'patternPreviewResize', { bubbles: true } ) );
	}, [ nodeSize.width, nodeSize.height ] );

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
			className={ classNames( 'pattern-preview', className, {
				'is-loading': ! renderedPattern,
				// For some reason, the CSS `:target` selector has trouble with the transition from
				// SSR markup to client-side React code, which is why we need the `is-targeted` class
				'is-targeted': window.location.hash === `#${ idAttr }`,
			} ) }
			id={ idAttr }
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
				tracksEventHandler={ recordGetAccessEvent }
			/>
		</div>
	);
}

export function PatternPreview( props: PatternPreviewProps ) {
	const { category, isResizable, pattern, patternTypeFilter } = props;
	const isMobile = useMobileBreakpoint();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

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
			onResizeStop={ () => {
				recordResizeEvent( 'calypso_pattern_library_resize' );
			} }
		>
			<PatternPreviewFragment { ...props } />
		</ResizableBox>
	);
}
