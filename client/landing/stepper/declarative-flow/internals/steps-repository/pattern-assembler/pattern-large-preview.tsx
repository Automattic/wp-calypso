import { PatternRenderer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect } from 'react';
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
	const containerRef = useRef< HTMLUListElement | null >( null );

	const renderPattern = ( key: string, pattern: Pattern ) => (
		<li key={ key }>
			<PatternRenderer patternId={ encodePatternId( pattern.id ) } />
		</li>
	);

	useEffect( () => {
		let timerId: number;
		const scrollIntoView = () => {
			const element = containerRef.current?.children[ activePosition ];
			if ( ! element ) {
				return;
			}

			const { height } = element.getBoundingClientRect();

			// Use the height to determine whether the newly added pattern is loaded.
			// If it's not loaded, try to delay the behavior of scrolling into view.
			if ( height && height > PATTERN_RENDERER_MIN_HEIGHT ) {
				element.scrollIntoView( {
					block: 'start',
					behavior: 'smooth',
				} );
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
			onDeviceChange={ ( device ) =>
				recordTracksEvent( 'calypso_signup_pattern_assembler_preview_device_click', { device } )
			}
		>
			{ hasSelectedPattern ? (
				<ul className="pattern-large-preview__patterns" ref={ containerRef }>
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
