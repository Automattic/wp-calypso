import React from 'react';
import uPlot from 'uplot';

export function tooltip(
	tooltipRef: React.MutableRefObject< HTMLDivElement | null >,
	formatDate: ( date: Date, hourly: boolean ) => string,
	hourly: boolean,
	formatValue: ( rawValue: number ) => string
) {
	return {
		hooks: {
			init: ( u: uPlot ) => {
				// Create the tooltip element
				if ( ! tooltipRef.current ) {
					tooltipRef.current = document.createElement( 'div' );
					tooltipRef.current.className = 'campaign-item-details__chart-tooltip';
					tooltipRef.current.style.display = 'none';
					u.over.parentNode?.appendChild( tooltipRef.current );
				}

				// Wrap mouse move in a Debounce to reduce the number of updates
				const handleMouseMove = ( e: MouseEvent ) => {
					if ( ! tooltipRef?.current ) {
						return;
					}

					// Get the mouse position relative to the chart
					const { left } = u.over.getBoundingClientRect();
					const mouseLeft = e.clientX - left;
					const activePoint = u.posToIdx( mouseLeft );
					const scaleFactor = window.devicePixelRatio || 1;

					// If a point is active, update the tooltip
					if ( activePoint >= 0 && tooltipRef.current ) {
						window.requestAnimationFrame( () => {
							if ( ! tooltipRef.current ) {
								return;
							}

							// Get the highlighted point
							const xPoint = u.data[ 0 ][ activePoint ];
							const yPoint = u.data[ 1 ][ activePoint ];
							if ( xPoint == null || yPoint == null ) {
								tooltipRef.current.style.display = 'none';
								return;
							}

							// Find where that is on the page, adjust for High DPI
							const xPos = Math.round( u.valToPos( xPoint, 'x', true ) ) / scaleFactor;
							const yPos = Math.round( u.valToPos( yPoint, 'y', true ) ) / scaleFactor;

							// Get the date / data value
							const date = u.data[ 0 ][ activePoint ];
							const value = u.data[ 1 ][ activePoint ];

							// If we have a value, put the tooltip just above it.
							if ( value != null ) {
								const tooltip = tooltipRef.current;
								tooltip.style.display = 'block';
								tooltip.style.left = `${ xPos - tooltip.offsetWidth / 2 }px`;
								tooltip.style.top = `${ yPos - 16 - tooltip.offsetHeight }px`;

								// Only update the content if it has changed to avoid unnecessary reflows
								const newTooltipContent = `
									<div class="campaign-item-details__chart-tooltip-date">
										<strong>${ formatDate( new Date( date * 1000 ), hourly ) }</strong>
									</div>
									<div class="campaign-item-details__chart-tooltip-divider"></div>
									<div class="campaign-item-details__chart-tooltip-data">
										${ formatValue( value ) }
									</div>
								`;

								if ( tooltip.innerHTML !== newTooltipContent ) {
									tooltip.innerHTML = newTooltipContent;
								}
							}
						} );
					} else if ( tooltipRef.current ) {
						tooltipRef.current.style.display = 'none';
					}
				};

				u.over.addEventListener( 'mousemove', handleMouseMove );
				u.over.addEventListener( 'mouseleave', () => {
					if ( tooltipRef.current ) {
						tooltipRef.current.style.display = 'none';
					}
				} );
			},
			destroy: () => {
				if ( tooltipRef.current && tooltipRef.current.parentNode ) {
					tooltipRef.current.parentNode.removeChild( tooltipRef.current );
					tooltipRef.current = null;
				}
			},
		},
	};
}
