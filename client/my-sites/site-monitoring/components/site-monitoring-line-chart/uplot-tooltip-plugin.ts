import { createRoot, Root } from 'react-dom/client';
import uPlot from 'uplot';

export interface UplotTooltipProps {
	data: number[][];
	idx: number;
}

/**
 * Custom tooltips plugin for uPlot.
 */
export function tooltipsPlugin( TooltipNode?: ( props: UplotTooltipProps ) => React.ReactNode ) {
	let cursortt: HTMLDivElement;
	let cursorRoot: Root;
	const context = {
		cursorMemo: new Map(),
	};

	/**
	 * Initializes the tooltips plugin.
	 */
	function init( u: uPlot ) {
		const over = u.over;

		const tooltipCursor = ( cursortt = document.createElement( 'div' ) );
		cursorRoot = createRoot( cursortt );
		tooltipCursor.className = 'uplot-tooltip';
		tooltipCursor.textContent = '';
		tooltipCursor.style.pointerEvents = 'none';
		tooltipCursor.style.position = 'absolute';
		over.appendChild( tooltipCursor );

		/**
		 * Hides all tooltips.
		 */
		function hideTips() {
			cursortt.style.display = 'none';
		}

		/**
		 * Shows all tooltips.
		 */
		function showTips() {
			cursortt.style.display = 'block';
		}

		over.addEventListener( 'mouseleave', () => {
			if ( ! u.cursor.lock ) {
				hideTips();
			}
		} );

		over.addEventListener( 'mouseenter', () => {
			showTips();
		} );

		if ( u.cursor.left ) {
			showTips();
		} else {
			hideTips();
		}
	}

	/**
	 * Sets the cursor for tooltips.
	 */
	function setCursor( u: uPlot ) {
		const { left, top, idx } = u.cursor;
		context?.cursorMemo?.set( left, top );
		cursortt.style.left = left + 'px';
		cursortt.style.top = top + 'px';

		if ( TooltipNode && idx && idx > 0 ) {
			cursorRoot.render(
				TooltipNode( {
					data: u.data as number[][],
					idx,
				} )
			);
		}
	}

	return {
		hooks: {
			init,
			setCursor,
		},
	};
}
