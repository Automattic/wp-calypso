/* eslint-disable @typescript-eslint/no-use-before-define, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-use-before-define, no-unused-vars, no-shadow, no-nested-ternary */
import uPlot from 'uplot';
import Quadtree, { distr } from '../lib/quadtree';

function pointWithin(
	px: number,
	py: number,
	rlft: number,
	rtop: number,
	rrgt: number,
	rbtm: number
) {
	return px >= rlft && px <= rrgt && py >= rtop && py <= rbtm;
}

/**
 * @see https://github.com/leeoniya/uPlot/blob/f2804d0787f493f472be1d4f718ac8940c093c04/demos/grouped-bars.js
 */
export default function seriesBarsPlugin(
	opts: { labels: any; ori?: any; dir?: any; padding?: any },
	spaceBetween = 1
) {
	const pxRatio = devicePixelRatio;

	const labels = opts.labels;

	const ori = opts.ori || 0;
	const dir = opts.dir || 1;

	const groupWidth = 0.9;
	const groupDistr = spaceBetween;

	const barWidth = 1;
	const barDistr = spaceBetween;

	const font = Math.round( 10 * pxRatio ) + 'px Arial';

	function walkTwo(
		yIdx: number,
		xCount: number,
		yCount: number,
		xDim: number,
		xDraw: ( ( arg0: any, arg1: number, arg2: number ) => any ) | null,
		yDraw: {
			( ix: any, x0: any, wid: any ): void;
			( ix: any, x0: any, wid: any ): void;
			( arg0: any, arg1: number, arg2: number ): void;
		}
	) {
		distr( xCount, groupWidth, groupDistr, null, ( ix: any, offPct: number, dimPct: number ) => {
			const groupOffPx = xDim * offPct;
			const groupWidPx = xDim * dimPct;

			xDraw && xDraw( ix, groupOffPx, groupWidPx );

			yDraw &&
				distr( yCount, barWidth, barDistr, yIdx, ( iy: any, offPct: number, dimPct: number ) => {
					const barOffPx = groupWidPx * offPct;
					const barWidPx = groupWidPx * dimPct;

					yDraw( ix, groupOffPx + barOffPx, barWidPx );
				} );
		} );
	}

	function drawBars( u: uPlot, sidx: number, i0: any, i1: any ) {
		return uPlot.orient(
			u,
			sidx,
			(
				series,
				dataX,
				dataY,
				scaleX,
				scaleY,
				valToPosX,
				valToPosY,
				xOff,
				yOff,
				xDim,
				yDim,
				moveTo,
				lineTo,
				rect
			) => {
				const fill = new Path2D();
				const stroke = new Path2D();

				// test ori, text align, text baseline...x0, y0,m width, height

				const numGroups = dataY.length;
				const barsPerGroup = u.series.length - 1;

				const y0Pos = valToPosY( 0, scaleY, yDim, yOff );

				const strokeWidth = series.width || 0;

				const _dir = dir * ( ori === 0 ? 1 : -1 );

				walkTwo( sidx - 1, numGroups, barsPerGroup, xDim, null, ( ix, x0, wid ) => {
					const lft = Math.round( xOff + ( _dir === 1 ? x0 : xDim - x0 - wid ) );
					const barWid = Math.round( wid ) - 2;

					const dataYIX = dataY[ ix ];
					if ( dataYIX !== null ) {
						const yPos = valToPosY( dataYIX, scaleY, yDim, yOff );

						const btm = Math.round( Math.max( yPos, y0Pos ) );
						const top = Math.round( Math.min( yPos, y0Pos ) );
						const barHgt = btm - top;

						if ( strokeWidth ) {
							rect(
								stroke,
								lft + strokeWidth / 2,
								top + strokeWidth / 2,
								barWid - strokeWidth,
								barHgt - strokeWidth
							);
						}

						if ( barHgt === 0 ) {
							const minHeight = 12;
							rect( fill, lft, y0Pos - minHeight, barWid, minHeight );
						} else {
							rect( fill, lft, top, barWid, barHgt );
						}

						const x = ori === 0 ? Math.round( lft - xOff ) : Math.round( top - yOff );
						const y = ori === 0 ? Math.round( top - yOff ) : Math.round( lft - xOff );
						const w = ori === 0 ? barWid : barHgt;
						const h = ori === 0 ? barHgt : barWid;

						qt.add( { x, y, w, h, sidx: sidx, didx: ix } );
					}
				} );

				return {
					stroke,
					fill,
				};
			}
		);
	}

	function drawPoints( u: uPlot, sidx: number, i0: any, i1: any ) {
		u.ctx.font = font;
		u.ctx.fillStyle = 'black';

		uPlot.orient(
			u,
			sidx,
			(
				series,
				dataX,
				dataY,
				scaleX,
				scaleY,
				valToPosX,
				valToPosY,
				xOff,
				yOff,
				xDim,
				yDim,
				moveTo,
				lineTo,
				rect
			) => {
				const numGroups = dataX.length;
				const barsPerGroup = u.series.length - 1;

				const _dir = dir * ( ori === 0 ? 1 : -1 );

				walkTwo( sidx - 1, numGroups, barsPerGroup, xDim, null, ( ix, x0, wid ) => {
					const lft = Math.round( xOff + ( _dir === 1 ? x0 : xDim - x0 - wid ) );
					const barWid = Math.round( wid );

					const dataYIX = dataY[ ix ];
					if ( dataYIX !== null ) {
						const yPos = valToPosY( dataYIX, scaleY, yDim, yOff );

						const x = ori === 0 ? Math.round( lft + barWid / 2 ) : Math.round( yPos );
						const y = ori === 0 ? Math.round( yPos ) : Math.round( lft + barWid / 2 );

						u.ctx.textAlign = ori === 0 ? 'center' : dataYIX >= 0 ? 'left' : 'right';
						u.ctx.textBaseline = ori === 1 ? 'middle' : dataYIX >= 0 ? 'bottom' : 'top';

						u.ctx.fillText( `${ dataYIX }`, x, y );
					}
				} );
			}
		);
	}

	function range( u: any, dataMin: any, dataMax: number ) {
		const [ min, max ] = uPlot.rangeNum( 0, dataMax, 0.05, true );
		return [ 0, max ];
	}

	let qt: {
		add: ( arg0: { x: number; y: number; w: number; h: number; sidx: number; didx: any } ) => void;
		clear: () => void;
		get: (
			arg0: number,
			arg1: number,
			arg2: number,
			arg3: number,
			arg4: ( o: any ) => void
		) => void;
	};
	let hovered: boolean | null = null;

	const barMark = document.createElement( 'div' );
	barMark.classList.add( 'bar-mark' );

	return {
		hooks: {
			init: ( u: {
				root: {
					querySelector: ( arg0: string ) => {
						(): any;
						new (): any;
						appendChild: { ( arg0: HTMLDivElement ): void; new (): any };
					};
				};
			} ) => {
				u.root.querySelector( '.u-over' ).appendChild( barMark );
			},
			drawClear: ( u: { bbox: { width: any; height: any }; series: any[] } ) => {
				qt = qt || new Quadtree( 0, 0, u.bbox.width, u.bbox.height, null );

				qt.clear();

				// force-clear the path cache to cause drawBars() to rebuild new quadtree
				u.series.forEach( ( s ) => {
					s._paths = null;
				} );
			},
			setCursor: ( u: { cursor: { left: number; top: number } } ) => {
				let found = null;
				const cx = u.cursor.left * pxRatio;
				const cy = u.cursor.top * pxRatio;

				qt.get( cx, cy, 1, 1, ( o ) => {
					if ( pointWithin( cx, cy, o.x, o.y, o.x + o.w, o.y + o.h ) ) {
						found = o;
					}
				} );

				if ( hovered !== null ) {
					hovered = null;
					barMark.style.display = 'none';
				}
			},
		},
		opts: ( u: any, opts: uPlot.Options ) => {
			const yScaleOpts = {
				range,
				ori: ori === 0 ? 1 : 0,
			};

			uPlot.assign( opts, {
				select: { show: false },
				cursor: {
					x: false,
					y: false,
					points: { show: false },
				},
				scales: {
					x: {
						time: false,
						distr: 2,
						ori,
						dir,
					},
					rend: yScaleOpts,
					size: yScaleOpts,
					mem: yScaleOpts,
					inter: yScaleOpts,
					toggle: yScaleOpts,
				},
			} );

			if ( ori === 1 ) {
				opts.padding = [ 0, null, 0, null ];
			}

			uPlot.assign( opts.axes?.[ 0 ] || {}, {
				splits: (
					u: {
						bbox: { width: any; height: any };
						data: string | any[];
						posToVal: ( arg0: number, arg1: string ) => any;
					},
					axisIdx: any
				) => {
					const dim = ori === 0 ? u.bbox.width : u.bbox.height;
					const _dir = dir * ( ori === 0 ? 1 : -1 );

					const splits: any[] = [];

					distr(
						u.data?.[ 1 ]?.length,
						groupWidth,
						groupDistr,
						null,
						( di: any, lftPct: number, widPct: number ) => {
							const groupLftPx = ( dim * lftPct ) / pxRatio;
							const groupWidPx = ( dim * widPct ) / pxRatio;

							const groupCenterPx = groupLftPx + groupWidPx / 2;

							splits.push( u.posToVal( groupCenterPx, 'x' ) );
						}
					);

					return _dir === 1 ? splits : splits.reverse();
				},
				values: () => labels(),
				gap: 15,
				size: 40,
				labelSize: 20,
				grid: { show: false },
				ticks: { show: false },
				side: ori === 0 ? 2 : 3,
			} );
			opts.series = [ {}, ...opts.series ];
			opts.series.forEach( ( s, i ) => {
				if ( i > 0 ) {
					uPlot.assign( s, {
						width: 0,
						paths: drawBars,
						points: {
							show: false, // drawPoints,
						},
					} );
				}
			} );
		},
	};
}
