import { createRoot, Root } from 'react-dom/client';
import uPlot from 'uplot';

export interface UplotTooltipProps {
	data: number[][];
	idx: number;
}

/**
 * Custom tooltips plugin for uPlot.
 */
export function tooltipsPlugin(
	TooltipNode?: ( props: UplotTooltipProps ) => React.ReactNode,
	options = { positionFixedTop: true }
) {
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
		const spaceBottom = 20;
		const { left, top = 0, idx } = u.cursor;
		context?.cursorMemo?.set( left, top );
		if ( idx == null ) {
			return;
		}

		const timestamp = u.data[ 0 ][ idx ];
		const leftPosition = Math.round( u.valToPos( timestamp, 'x' ) ) + 'px';
		cursortt.style.left = options.positionFixedTop ? leftPosition : `${ left }px`;
		cursortt.style.top = options.positionFixedTop ? '0px' : `${ top - spaceBottom }px`;

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
