import { PatternRenderer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { useStyle } from '@automattic/global-styles';
import { Icon, layout } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState, CSSProperties } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import PatternActionBar from './pattern-action-bar';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-large-preview.scss';

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
}: Props ) => {
	const translate = useTranslate();
	const hasSelectedPattern = header || sections.length || footer;
	const frameRef = useRef< HTMLDivElement | null >( null );
	const listRef = useRef< HTMLUListElement | null >( null );
	const [ viewportHeight, setViewportHeight ] = useState< number | undefined >( 0 );
	const [ blockGap ] = useStyle( 'spacing.blockGap' );
	const [ backgroundColor ] = useStyle( 'color.background' );
	const [ patternLargePreviewStyle, setPatternLargePreviewStyle ] = useState( {
		'--pattern-large-preview-block-gap': blockGap,
		'--pattern-large-preview-background': backgroundColor,
	} as CSSProperties );

	const renderPattern = ( type: string, pattern: Pattern, position = -1 ) => {
		const key = type === 'section' ? pattern.key : type;
		const getActionBarProps = () => {
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

		return (
			<li
				key={ key }
				className={ classnames(
					'pattern-large-preview__pattern',
					`pattern-large-preview__pattern-${ type }`
				) }
			>
				<PatternRenderer
					patternId={ encodePatternId( pattern.id ) }
					viewportHeight={ viewportHeight || frameRef.current?.clientHeight }
					// Disable default max-height
					maxHeight="none"
				/>
				<PatternActionBar
					patternType={ type }
					isRemoveButtonTextOnly
					source="large_preview"
					{ ...getActionBarProps() }
				/>
			</li>
		);
	};

	const updateViewportHeight = () => {
		setViewportHeight( frameRef.current?.clientHeight );
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

	useEffect( () => {
		const handleResize = () => updateViewportHeight();
		window.addEventListener( 'resize', handleResize );

		return () => window.removeEventListener( 'resize', handleResize );
	} );

	// Delay updating the styles to make the transition smooth
	// See https://github.com/Automattic/wp-calypso/pull/74033#issuecomment-1453056703
	useEffect( () => {
		setPatternLargePreviewStyle( {
			'--pattern-large-preview-block-gap': blockGap,
			'--pattern-large-preview-background': backgroundColor,
		} as CSSProperties );
	}, [ blockGap, backgroundColor ] );

	return (
		<DeviceSwitcher
			className="pattern-large-preview"
			isShowDeviceSwitcherToolbar
			isShowFrameBorder
			frameRef={ frameRef }
			onDeviceChange={ ( device ) => {
				recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PREVIEW_DEVICE_CLICK, { device } );
				// Wait for the animation to end in 200ms
				window.setTimeout( updateViewportHeight, 205 );
			} }
		>
			{ hasSelectedPattern ? (
				<ul
					className="pattern-large-preview__patterns"
					style={ patternLargePreviewStyle }
					ref={ listRef }
				>
					{ header && renderPattern( 'header', header ) }
					{ sections.map( ( pattern, i ) => renderPattern( 'section', pattern, i ) ) }
					{ footer && renderPattern( 'footer', footer ) }
				</ul>
			) : (
				<div className="pattern-large-preview__placeholder">
					<Icon className="pattern-large-preview__placeholder-icon" icon={ layout } size={ 72 } />
					<h2>{ translate( 'Welcome to your blank canvas' ) }</h2>
					<span>
						{ translate( "It's time to get creative. Add your first pattern to get started." ) }
					</span>
				</div>
			) }
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
