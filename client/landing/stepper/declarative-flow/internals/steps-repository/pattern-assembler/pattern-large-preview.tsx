import { PatternRenderer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-large-preview.scss';

interface Props {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	activePosition: number;
}

// The pattern renderer element has 1px min height before the pattern is loaded
const PATTERN_RENDERER_MIN_HEIGHT = 1;

const PatternLargePreview = ( { header, sections, footer, activePosition }: Props ) => {
	const translate = useTranslate();
	const hasSelectedPattern = header || sections.length || footer;
	const frameRef = useRef< HTMLDivElement | null >( null );
	const listRef = useRef< HTMLUListElement | null >( null );
	const [ viewportHeight, setViewportHeight ] = useState< number | undefined >( 0 );

	const renderPattern = ( key: string, pattern: Pattern ) => (
		<li key={ key }>
			<PatternRenderer
				patternId={ encodePatternId( pattern.id ) }
				viewportHeight={ viewportHeight || frameRef.current?.clientHeight }
				// Disable default max-height
				maxHeight="none"
			/>
		</li>
	);

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

	return (
		<DeviceSwitcher
			className="pattern-large-preview"
			isShowDeviceSwitcherToolbar
			isShowFrameBorder
			frameRef={ frameRef }
			onDeviceChange={ ( device ) => {
				recordTracksEvent( 'calypso_signup_pattern_assembler_preview_device_click', { device } );
				// Wait for the animation to end in 200ms
				window.setTimeout( updateViewportHeight, 205 );
			} }
		>
			{ hasSelectedPattern ? (
				<ul className="pattern-large-preview__patterns" ref={ listRef }>
					{ header && renderPattern( 'header', header ) }
					{ sections.map( ( pattern ) => renderPattern( pattern.key!, pattern ) ) }
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
