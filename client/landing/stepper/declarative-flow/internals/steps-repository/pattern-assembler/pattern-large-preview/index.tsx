import { PatternRenderer, BlockRendererContainer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { Icon, layout } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState } from 'react';
import { NAVIGATOR_PATHS, STYLES_PATHS } from '../constants';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import PatternActionBar from '../pattern-action-bar';
import PatternActionBarPopover from './pattern-action-bar-popover';
import { encodePatternId } from '../utils';
import type { Pattern } from '../types';
import type { MouseEvent } from 'react';
import './style.scss';

type BlockPopoverData = {
	type: string;
	element: HTMLElement;
};

interface Props {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	activePosition: number;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

// The pattern renderer element has 1px min height before the pattern is loaded
const PATTERN_RENDERER_MIN_HEIGHT = 1;

const PatternLargePreview = ( {
	header,
	sections,
	footer,
	activePosition,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onDeleteHeader,
	onDeleteFooter,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const navigator = useNavigator();
	const hasSelectedPattern = header || sections.length || footer;
	const shouldShowSelectPatternHint =
		! hasSelectedPattern && STYLES_PATHS.includes( navigator.location.path );
	const frameRef = useRef< HTMLDivElement | null >( null );
	const listRef = useRef< HTMLDivElement | null >( null );
	const [ blockPopoverData, setBlockPopoverData ] = useState< BlockPopoverData | null >( null );

	const goToSelectHeaderPattern = () => {
		navigator.goTo( NAVIGATOR_PATHS.HEADER );
	};

	const handleAddHeaderClick = ( event: MouseEvent ) => {
		event.preventDefault();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.LARGE_PREVIEW_ADD_HEADER_BUTTON_CLICK );
		goToSelectHeaderPattern();
	};

	const getDescription = () => {
		if ( ! shouldShowSelectPatternHint ) {
			return translate( "It's time to get creative. Add your first pattern to get started." );
		}

		const options = {
			components: {
				link: (
					// eslint-disable-next-line jsx-a11y/anchor-is-valid
					<a href="#" target="_blank" rel="noopener noreferrer" onClick={ handleAddHeaderClick } />
				),
			},
		};

		return hasEnTranslation(
			'You can view your color and font selections after you select a pattern. Get started by {{link}}adding a header pattern{{/link}}'
		)
			? translate(
					'You can view your color and font selections after you select a pattern. Get started by {{link}}adding a header pattern{{/link}}',
					options
			  )
			: translate(
					'You can view your color and font selections after you select a pattern, get started by {{link}}adding a header pattern{{/link}}',
					options
			  );
	};

	const getActionBarProps = () => {
		if ( ! blockPopoverData ) {
			return {};
		}

		const { type, element } = blockPopoverData;
		const position = Number( element.dataset.position );
		if ( type === 'header' ) {
			return { onDelete: onDeleteHeader };
		} else if ( type === 'footer' ) {
			return { onDelete: onDeleteFooter };
		}

		return {
			disableMoveUp: position === 0,
			disableMoveDown: sections?.length === position + 1,
			onDelete: () => onDeleteSection( position ),
			onMoveUp: () => onMoveUpSection( position ),
			onMoveDown: () => onMoveDownSection( position ),
		};
	};

	const renderPattern = ( type: string, pattern: Pattern, position = -1 ) => {
		const key = type === 'section' ? pattern.key : type;
		const handleMouseEnter = ( event: MouseEvent ) => {
			setBlockPopoverData( {
				type,
				element: event.currentTarget as HTMLElement,
			} );
		};

		const handleMouseLeave = ( event: MouseEvent ) => {
			const { clientX, clientY } = event;
			const target = event.target as HTMLElement;
			const { offsetParent } = target;
			const { left, right, top, bottom } = target.getBoundingClientRect();

			// Use the position to determine whether the mouse leaves the current element or not
			// because the element is inside the iframe and we cannot get the next element from
			// the event.relatedTarget
			if (
				clientX <= Math.max( left, 0 ) ||
				clientX >= Math.min( right, offsetParent?.clientWidth || Infinity ) ||
				clientY <= Math.max( top, 0 ) ||
				clientY >= Math.min( bottom, offsetParent?.clientHeight || Infinity )
			) {
				setBlockPopoverData( null );
			}
		};

		return (
			<div
				key={ key }
				className={ classnames(
					'pattern-large-preview__pattern',
					`pattern-large-preview__pattern-${ type }`
				) }
				data-position={ position }
				onMouseEnter={ handleMouseEnter }
				onMouseLeave={ handleMouseLeave }
			>
				<PatternRenderer patternId={ encodePatternId( pattern.ID ) } isContentOnly />
			</div>
		);
	};

	useEffect( () => {
		let timerId: number;
		const scrollIntoView = () => {
			const element = listRef.current?.children[ activePosition ];
			if ( ! element ) {
				return;
			}

			const { height } = element.getBoundingClientRect();

			// Use the height to determine whether the newly added pattern is loaded.
			// If it's not loaded, try to delay the behavior of scrolling into view.
			if ( height && height > PATTERN_RENDERER_MIN_HEIGHT ) {
				// Note that Firefox has an issue related to "smooth" behavior, so we leave it as default
				// See https://github.com/Automattic/wp-calypso/pull/71527#issuecomment-1370522634
				element.scrollIntoView();
			} else {
				timerId = window.setTimeout( () => scrollIntoView(), 100 );
			}
		};

		scrollIntoView();

		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ activePosition, header, sections, footer ] );

	return (
		<DeviceSwitcher
			className="pattern-large-preview"
			isShowDeviceSwitcherToolbar
			isShowFrameBorder
			frameRef={ frameRef }
			frameClassName="pattern-large-preview__frame"
			onDeviceChange={ ( device ) => {
				recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PREVIEW_DEVICE_CLICK, { device } );
			} }
		>
			<>
				{ hasSelectedPattern ? (
					<BlockRendererContainer enablePointerEvent>
						<div
							className="pattern-large-preview__patterns"
							style={ {
								height: '100vh',
								overflow: 'auto',
							} }
							ref={ listRef }
						>
							{ header && renderPattern( 'header', header ) }
							{ sections.map( ( pattern, i ) => renderPattern( 'section', pattern, i ) ) }
							{ footer && renderPattern( 'footer', footer ) }
						</div>
					</BlockRendererContainer>
				) : (
					<div className="pattern-large-preview__placeholder">
						<Icon className="pattern-large-preview__placeholder-icon" icon={ layout } size={ 72 } />
						<h2>{ translate( 'Welcome to your blank canvas' ) }</h2>
						<span>{ getDescription() }</span>
					</div>
				) }
				{ blockPopoverData && (
					<PatternActionBarPopover referenceElement={ blockPopoverData?.element }>
						<PatternActionBar
							patternType={ blockPopoverData.type }
							isRemoveButtonTextOnly
							source="large_preview"
							{ ...getActionBarProps() }
						/>
					</PatternActionBarPopover>
				) }
			</>
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
