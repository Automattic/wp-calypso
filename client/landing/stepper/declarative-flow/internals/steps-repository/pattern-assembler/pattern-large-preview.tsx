import { PatternRenderer } from '@automattic/block-renderer';
import { Button, DeviceSwitcher } from '@automattic/components';
import { useGlobalStyle } from '@automattic/global-styles';
import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState, CSSProperties } from 'react';
import { NAVIGATOR_PATHS, STYLES_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import PatternActionBar from './pattern-action-bar';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import type { MouseEvent } from 'react';
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
	onShuffle: ( type: string, pattern: Pattern, position?: number ) => void;
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
	onShuffle,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const navigator = useNavigator();
	const hasSelectedPattern = header || sections.length || footer;
	const shouldShowSelectPatternHint =
		! hasSelectedPattern &&
		navigator.location.path &&
		STYLES_PATHS.includes( navigator.location.path );
	const frameRef = useRef< HTMLDivElement | null >( null );
	const listRef = useRef< HTMLUListElement | null >( null );
	const [ viewportHeight, setViewportHeight ] = useState< number | undefined >( 0 );
	const [ device, setDevice ] = useState< string >( 'computer' );
	const [ blockGap ] = useGlobalStyle( 'spacing.blockGap' );
	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const [ patternLargePreviewStyle, setPatternLargePreviewStyle ] = useState( {
		'--pattern-large-preview-block-gap': blockGap,
		'--pattern-large-preview-background': backgroundColor,
	} as CSSProperties );

	const goToSelectHeaderPattern = () => {
		navigator.goTo( NAVIGATOR_PATHS.HEADER );
	};

	const handleAddHeaderClick = ( event: MouseEvent ) => {
		event.preventDefault();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.LARGE_PREVIEW_ADD_HEADER_BUTTON_CLICK );
		goToSelectHeaderPattern();
	};

	const getTitle = () => {
		if ( ! shouldShowSelectPatternHint ) {
			return translate( 'Welcome to your homepage.' );
		}

		return translate( 'Ready to start designing?' );
	};

	const getDescription = () => {
		if ( ! shouldShowSelectPatternHint ) {
			return translate( "It's time to get creative. Add your first pattern to get started." );
		}

		return translate( 'You can view your color and font selections after you select a pattern.' );
	};

	const getAction = () => {
		if ( ! shouldShowSelectPatternHint ) {
			return null;
		}

		return <Button onClick={ handleAddHeaderClick }>{ translate( 'Add header' ) }</Button>;
	};

	const renderPattern = ( type: string, pattern: Pattern, position = -1 ) => {
		const key = type === 'section' ? pattern.key : type;
		const handleShuffle = () => onShuffle( type, pattern, position );
		const getActionBarProps = () => {
			if ( type === 'header' ) {
				return { onDelete: onDeleteHeader, onShuffle: handleShuffle };
			} else if ( type === 'footer' ) {
				return { onDelete: onDeleteFooter, onShuffle: handleShuffle };
			}

			return {
				disableMoveUp: position === 0,
				disableMoveDown: sections?.length === position + 1,
				onDelete: () => onDeleteSection( position ),
				onMoveUp: () => onMoveUpSection( position ),
				onMoveDown: () => onMoveDownSection( position ),
				onShuffle: handleShuffle,
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
					key={ device }
					patternId={ encodePatternId( pattern.ID ) }
					viewportHeight={ viewportHeight || frameRef.current?.clientHeight }
					// Disable default max-height
					maxHeight="none"
				/>
				<PatternActionBar
					patternType={ type }
					category={ pattern.category }
					isRemoveButtonTextOnly
					source="large_preview"
					{ ...getActionBarProps() }
				/>
			</li>
		);
	};

	const updateViewportHeight = ( height?: number ) => {
		// Required for 100vh patterns
		setViewportHeight( height );
	};

	// Scroll to newly added patterns
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
			isShowFrameShadow={ false }
			isFixedViewport={ !! hasSelectedPattern }
			frameRef={ frameRef }
			onDeviceChange={ ( device ) => {
				recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PREVIEW_DEVICE_CLICK, { device } );
				setDevice( device );
			} }
			onViewportChange={ updateViewportHeight }
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
					<h2>{ getTitle() }</h2>
					<span>{ getDescription() }</span>
					{ getAction() }
				</div>
			) }
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
