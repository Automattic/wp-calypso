import uPlot from 'uplot';

/**
 * Definition of the column highlight plugin.
 * @returns {Object} The uPlot plugin object with hooks.
 */
export function timeHighlightPlugin( timeSlot: number | 'auto' = 86400 ) {
	let overEl;
	let highlightEl: HTMLElement;

	/**
	 * Initialize the plugin
	 * @param {uPlot} u - The uPlot instance.
	 */
	function init( u: uPlot ) {
		overEl = u.over;

		highlightEl = document.createElement( 'div' );

		highlightEl.classList.add( 'day-highlighter' );

		uPlot.assign( highlightEl.style, {
			pointerEvents: 'none',
			display: 'none',
			position: 'absolute',
			left: 0,
			top: 0,
			height: '100%',
			backgroundColor: 'rgba(0,0,0,0.04)',
		} );

		overEl.appendChild( highlightEl );

		// show/hide highlight on enter/exit
		overEl.addEventListener( 'mouseenter', () => {
			highlightEl.style.display = 'block';
		} );
		overEl.addEventListener( 'mouseleave', () => {
			highlightEl.style.display = 'none';
		} );
	}

	/**
	 * On update
	 */
	function update( u: uPlot ) {
		const { idx } = u.cursor;
		if ( idx == null ) {
			return;
		}
		// Timestamp of the cursor position
		const timestamp: number = u.data[ 0 ][ idx ];
		let timeSlotToHighlight = timeSlot as number;
		if ( timeSlot === 'auto' ) {
			const dataLength = u.data[ 0 ].length;
			const firstTimestamp = u.data[ 0 ][ 0 ];
			const lastTimestamp = u.data[ 0 ][ dataLength - 1 ];
			const paddingUnits = 3;
			timeSlotToHighlight = ( ( lastTimestamp - firstTimestamp ) * paddingUnits ) / dataLength;
		}

		// Find start and end of day for the cursor position
		const startOfSlot = timestamp - timeSlotToHighlight / 2;
		const endOfSlot = startOfSlot + timeSlotToHighlight;

		// Find the left position, and width of the box, bounded by the range of the graph
		const boxLeft = u.valToPos( Math.max( startOfSlot, u.scales.x.min || 0 ), 'x' );
		const boxWidth = u.valToPos( Math.min( endOfSlot, u.scales.x.max || 0 ), 'x' ) - boxLeft;

		// Update the highlight box
		highlightEl.style.transform = 'translateX(' + Math.round( boxLeft ) + 'px)';
		highlightEl.style.width = Math.round( boxWidth ) + 'px';
	}

	return {
		opts: ( u: uPlot, opts: uPlot.Options ) => {
			uPlot.assign( opts, {
				cursor: {
					x: false,
					y: false,
				},
			} );
		},
		hooks: {
			init: init,
			setCursor: update,
		},
	};
}
