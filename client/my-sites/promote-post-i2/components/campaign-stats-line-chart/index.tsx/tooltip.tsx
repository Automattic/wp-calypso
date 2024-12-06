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
				if ( ! tooltipRef.current ) {
					tooltipRef.current = document.createElement( 'div' );
					tooltipRef.current.className = 'campaign-item-details__chart-tooltip';
					u.over.parentNode?.appendChild( tooltipRef.current );
				}

				u.over.addEventListener( 'mousemove', ( e ) => {
					if ( ! tooltipRef?.current ) {
						return;
					}

					const { left } = u.over.getBoundingClientRect();
					const mouseLeft = e.clientX - left;
					const activePoint = u.posToIdx( mouseLeft );

					if ( activePoint && tooltipRef.current ) {
						window.requestAnimationFrame( () => {
							if ( ! tooltipRef.current ) {
								return;
							}

							// Get the highlighted point
							const xPoint = u.data[ 0 ][ activePoint ] ?? 0;
							const yPoint = u.data[ 1 ][ activePoint ] ?? 0;

							// Find where that is on the page
							const xPos = Math.round( u.valToPos( xPoint, 'x', true ) );
							const yPos = Math.round( u.valToPos( yPoint, 'y', true ) );

							// Get the date / data value
							const date = u.data[ 0 ][ activePoint ];
							const value = u.data[ 1 ][ activePoint ];

							// If we have a value, put the tooltip just above it.
							if ( value != null ) {
								tooltipRef.current.style.display = 'block';
								tooltipRef.current.style.left = `${ xPos - tooltipRef.current.offsetWidth / 2 }px`;
								tooltipRef.current.style.top = `${ yPos - 16 - tooltipRef.current.offsetHeight }px`;

								tooltipRef.current.innerHTML = `
									<div class="campaign-item-details__chart-tooltip-date">
										<strong>${ formatDate( new Date( date * 1000 ), hourly ) }</strong>
									</div>
									<div class="campaign-item-details__chart-tooltip-divider"></div>
									<div class="campaign-item-details__chart-tooltip-data">
										${ formatValue( value ) }
									</div>
								`;
							}
						} );
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
