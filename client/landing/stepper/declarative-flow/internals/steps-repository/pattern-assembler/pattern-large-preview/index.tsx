import { PatternsRendererContainer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState, useMemo } from 'react';
import { NAVIGATOR_PATHS, STYLES_PATHS } from '../constants';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import PatternActionBar from '../pattern-action-bar';
import { encodePatternId } from '../utils';
import PatternItem from './pattern-item';
import PatternOverlay from './pattern-overlay';
import useActionBarProps from './use-action-bar-props';
import type { Pattern } from '../types';
import type { CSSProperties, MouseEvent } from 'react';
import './style.scss';

interface Props {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	activePatternKey?: string;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

// The pattern renderer element has 1px min height before the pattern is loaded
const PATTERN_RENDERER_MIN_HEIGHT = 1;

// The container of patterns is inside the iframe, so we need to use inline style
const LIST_STYLE: CSSProperties = {
	position: 'absolute',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	height: '100vh',
	overflow: 'auto',
};

const PatternLargePreview = ( {
	header,
	sections,
	footer,
	activePatternKey,
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
	const patternIds = useMemo(
		() =>
			[ header, ...sections, footer ]
				.filter( Boolean )
				.map( ( pattern ) => pattern && encodePatternId( pattern.ID ) ) as string[],
		[ header, sections, footer ]
	);
	const hasSelectedPattern = patternIds.length > 0;
	const shouldShowSelectPatternHint =
		! hasSelectedPattern && STYLES_PATHS.includes( navigator.location.path );
	const listRef = useRef< HTMLDivElement | null >( null );
	const frameRef = useRef< HTMLDivElement | null >( null );
	const [ hoveredElement, setHoveredElement ] = useState< HTMLElement | null >( null );
	const actionBarProps = useActionBarProps( {
		element: hoveredElement,
		sectionsLength: sections.length,
		onDeleteSection,
		onMoveUpSection,
		onMoveDownSection,
		onDeleteHeader,
		onDeleteFooter,
	} );

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

	useEffect( () => {
		let timerId: number;
		const scrollIntoView = () => {
			const element =
				activePatternKey && listRef.current?.ownerDocument.getElementById( activePatternKey );
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
	}, [ activePatternKey, header, sections, footer ] );

	// Unset the hovered element when it's removed
	useEffect( () => {
		if ( hoveredElement && ! hoveredElement?.ownerDocument?.getElementById( hoveredElement.id ) ) {
			setHoveredElement( null );
		}
	}, [ patternIds.length, setHoveredElement ] );

	// Unset the hovered element when the mouse is leaving the large preview
	useEffect( () => {
		const handleMouseLeave = () => setHoveredElement( null );
		frameRef.current?.addEventListener( 'mouseleave', handleMouseLeave );
		return () => {
			frameRef.current?.removeEventListener( 'mouseleave', handleMouseLeave );
		};
	}, [ frameRef, setHoveredElement ] );

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
					<PatternsRendererContainer patternIds={ patternIds }>
						<div className="wp-site-blocks" style={ LIST_STYLE } ref={ listRef }>
							<PatternItem pattern={ header } type="header" onHover={ setHoveredElement } />
							<main className="wp-block-group">
								{ sections.map( ( pattern, i ) => (
									<PatternItem
										key={ pattern.key }
										pattern={ pattern }
										type="section"
										position={ i }
										onHover={ setHoveredElement }
									/>
								) ) }
							</main>
							<PatternItem pattern={ footer } type="footer" onHover={ setHoveredElement } />
						</div>
					</PatternsRendererContainer>
				) : (
					<div className="pattern-large-preview__placeholder">
						<Icon className="pattern-large-preview__placeholder-icon" icon={ layout } size={ 72 } />
						<h2>{ translate( 'Welcome to your blank canvas' ) }</h2>
						<span>{ getDescription() }</span>
					</div>
				) }

				{ hoveredElement && (
					<PatternOverlay
						referenceElement={ hoveredElement }
						stickyContent={
							actionBarProps && (
								<PatternActionBar
									isRemoveButtonTextOnly
									source="large_preview"
									{ ...actionBarProps }
								/>
							)
						}
					>
						<div className="pattern-large-preview__pattern-box-shadow" />
					</PatternOverlay>
				) }
			</>
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
