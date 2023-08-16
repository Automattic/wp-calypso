import { createRoot } from 'react-dom/client';
import uPlot from 'uplot';

/**
 * Custom tooltips plugin for uPlot.
 *
 * @returns {Object} The uPlot plugin object with hooks.
 */
export function tooltipsPlugin( formattedData, TooltipNode?: ( cursorData: any ) => void = null ) {
	let cursortt;
	let cursorRoot;
	const context = {
		cursorMemo: new Map(),
	};

	/**
	 * Initializes the tooltips plugin.
	 *
	 * @param {uPlot} u - The uPlot instance.
	 * @param {Object} opts - Options for the uPlot instance.
	 */
	function init( u, opts ) {
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
			// cursortt.style.display = 'none';
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

		if ( u.cursor.left < 0 ) {
			hideTips();
		} else {
			showTips();
		}
	}

	/**
	 * Sets the cursor for tooltips.
	 *
	 * @param {uPlot} u - The uPlot instance.
	 */
	function setCursor( u ) {
		const { left, top, idx } = u.cursor;
		window.u = u;
		context?.cursorMemo?.set( left, top );
		cursortt.style.left = left + 'px';
		cursortt.style.top = top + 'px';
		const xVal = u.data[ 0 ][ idx ];
		const yVal = u.data[ 1 ][ idx ];

		// Timestamp of the cursor position
		const timestamp = u.data[ 0 ][ idx ];
		// Find start and end of day for the cursor position
		const startOfDay = timestamp - ( timestamp % 86400 );
		const endOfDay = startOfDay + 86400;

		// Find the left position, and width of the box, bounded by the range of the graph
		const boxLeft = u.valToPos( Math.max( startOfDay, u.scales.x.min ), 'x' );
		const boxWidth = u.valToPos( Math.min( endOfDay, u.scales.x.max ), 'x' ) - boxLeft;
		const boxCenter = boxLeft + boxWidth / 2;

		// cursortt.textContent =
		// 	`${ xVal }, ${ yVal }` +
		// 	'(' +
		// 	u.posToVal( left, 'x' ).toFixed( 2 ) +
		// 	', ' +
		// 	u.posToVal( top, 'y' ).toFixed( 2 ) +
		// 	')';
		if ( TooltipNode && idx > 0 ) {
			cursorRoot.render(
				TooltipNode( {
					data: u.data,
					boxCenter,
					idx,
					cursorTop: top,
					cursorLeft: left,
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
