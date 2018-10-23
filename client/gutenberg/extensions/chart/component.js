/**
 * External dependencies
 *
 * @format
 */

import { Component, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
import { loadScript } from './load-script';
import classnames from 'classnames';
import GoogleDocLoader from './google-doc-loader';
import { includes } from 'lodash';

export class Chart extends Component {
	constructor() {
		super( ...arguments );
		this.state = {};
		this.chartRef = createRef();
		this.chartTitleRef = createRef();
	}
	render() {
		const { chart_type, children } = this.props;
		const { hasPoints } = this.state;
		const classes = classnames(
			includes( [ 'donut', 'pie' ], chart_type ) ? 'centered-legend' : null,
			hasPoints ? null : 'pointless'
		);
		return (
			<div className={ classes }>
				<p className="chart-title" ref={ this.chartTitleRef }>
					{ children }
				</p>
				<div class="a8c-chart-wrapper a8c-cover-text-color" ref={ this.chartRef } />
			</div>
		);
	}
	componentDidMount() {
		// window.jQuery( this.chartRef.current ).on('alignmentChanged', this.alignmentChanged);
		window.addEventListener( 'resize', this.resizeChartAfterWindowResize );

		this.loadMultipleLibraries(
			[
				'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js',
			],
			this.graph_libs_ready
		);
	}
	componentDidUpdate( prevProps ) {
		const {
			chart_type,
			colors,
			googlesheet_url,
			number_format,
			x_axis_label,
			y_axis_label,
		} = this.props;
		if ( chart_type !== prevProps.chart_type ) {
			this.chart_typeChanged( chart_type );
		}
		if ( colors !== prevProps.colors ) {
			this.colorsChanged( colors );
		}
		if ( googlesheet_url !== prevProps.googlesheet_url ) {
			this.googlesheet_urlChanged( googlesheet_url );
		}
		if ( number_format !== prevProps.number_format ) {
			this.number_formatChanged( number_format );
		}
		if ( x_axis_label !== prevProps.x_axis_label ) {
			this.labelTextChanged();
		}
		if ( y_axis_label !== prevProps.y_axis_label ) {
			this.labelTextChanged();
		}
	}
	resizeChartAfterWindowResize = () => {
		this.debounce(
			'resizeChart',
			function() {
				this.resizeChart();
			},
			150
		);
	};
	loadMultipleLibraries( libraries, callback ) {
		const status = [];
		libraries.forEach( library => {
			status.push( library );
			loadScript( library, error => {
				if ( error ) {
					return;
				}
				status.splice( 0, 1 );
				if ( status.length === 0 ) {
					callback();
				}
			} );
		} );
	}
	maxTimeseriesPoints( timeseries ) {
		const defaultCount = 7;
		return Math.min( defaultCount, timeseries.length );
	}
	number_formatChanged() {
		this.makeChartFromData();
	}
	labelTextChanged() {
		const { x_axis_label, y_axis_label } = this.props;
		const { theChart } = this.state;

		if ( ! this.chartfulness() ) {
			return;
		}

		theChart.axis.labels( {
			x: x_axis_label,
			y: y_axis_label,
		} );
	}
	colorsChanged() {
		const { chart_data, theChart } = this.state;

		if ( ! this.chartfulness() ) {
			return;
		}

		const colorObject = this.colorsForData( chart_data.rows, 'object' );
		theChart.data.colors( colorObject );
	}
	chartfulness() {
		const { theChart } = this.state;
		return !! theChart;
	}
	colorsForData( rows, type ) {
		const { colors } = this.props;
		const colorObject = {};
		const colorArray = [];
		for ( let x = 0; x < rows.length; x++ ) {
			const key = rows[ x ][ 0 ];
			if ( colors[ x ] ) {
				colorObject[ key ] = colors[ x ];
			} else {
				colorObject[ key ] = settings.allColors[ x % settings.allColors.length ];
			}

			colorArray.push( colorObject[ key ] );
		}

		return type === 'object' ? colorObject : colorArray;
	}
	googlesheet_urlChanged() {
		if ( ! this.validateURL( this.googlesheet_url ) ) {
			if ( this._reversionTimeout ) {
				clearTimeout( this._reversionTimeout );
			}

			this._reversionTimeout = setTimeout(
				function() {
					if ( ! this.validateURL( this.googlesheet_url ) ) {
						// this.googlesheet_url = this.defaultURL;
					}
				}.bind( this ),
				2000
			);
		}
		this.downloadAndStoreGoogleSheetsData();
	}
	chart_typeChanged( val ) {
		const { theChart } = this.state;
		if ( this.chartfulness() ) {
			this.resizeChart();
			theChart.transform( val );
		}
	}
	makeChart( header, rows, type ) {
		const { admin, chart_type, x_axis_label, y_axis_label, number_format } = this.props;
		const { chart_data, c3, d3, jQuery } = this.state;
		const containerHeight = jQuery( this.chartRef.current ).height();
		const clean = jQuery.extend( true, [], rows );
		const xtick = {
			culling: {
				max: 20,
			},
			fit: false,
			outer: true,
			multiline: false,
		};
		const ytick = {
			culling: true,
			fit: true,
			format: function() {
				const format = d3.format( ',.2f' ),
					stripTrailingZeros = function( d ) {
						const result = format( d );
						return result.replace( /\.0+$/, '' );
					};

				if ( number_format === 'percent' ) {
					return function( d ) {
						return stripTrailingZeros( d ) + '%';
					};
				} else if ( number_format === 'euro' ) {
					return function( d ) {
						return stripTrailingZeros( d ) + '€';
					};
				} else if ( number_format === 'pound' ) {
					return function( d ) {
						return '£' + stripTrailingZeros( d );
					};
				} else if ( number_format === 'dollar' ) {
					return function( d ) {
						return '$' + stripTrailingZeros( d );
					};
				}
				return stripTrailingZeros;
			}.bind( this )(),
		};
		const legend = {
			show: false,
			position: 'bottom',
		};
		const point = {
			show: true,
		};

		if ( this.shouldRotate( type ) ) {
			xtick.rotate = 50;
		}
		if ( rows[ 0 ].length > 80 ) {
			point.show = false;
			this.setState( { hasPoints: false } );
		} else {
			this.setState( { hasPoints: true } );
		}
		const xAxisObject = {
			type: type,
			tick: xtick,
		};
		const yAxisObject = {
			tick: ytick,
		};
		const dataObject = {
			columns: clean,
			type: chart_type,
			colors: this.colorsForData( rows, 'object' ),
		};

		if ( type === 'category' ) {
			xAxisObject.categories = header;
			xtick.fit = true;
		} else if ( type === 'timeseries' ) {
			clean.splice( 0, 0, header );
			dataObject.x = 'x';
			xtick.format = chart_data.format;
			xtick.values = chart_data.values;
		}

		if ( y_axis_label.length || admin ) {
			yAxisObject.label = {
				text: y_axis_label,
				position: 'outer-middle',
			};
		}

		if ( x_axis_label.length || admin ) {
			xAxisObject.label = {
				text: x_axis_label,
				position: 'outer-center',
			};
		}
		const tooltip = {};
		if ( type === 'timeseries' ) {
			tooltip.format = {
				title: function( x ) {
					const dateFormatter = d3.time.format( '%m/%d/%Y' );
					return dateFormatter( x );
				},
			};
		}

		if ( 'ontouchstart' in window ) {
			tooltip.show = false;
		}

		const c3Object = {
				padding: {
					right: 35,
				},
				bindto: this.chartRef.current,
				transition: {
					duration: 350, // Default
				},
				data: dataObject,
				axis: {
					x: xAxisObject,
					y: yAxisObject,
				},
				legend: legend,
				point: point,
				tooltip: tooltip,
			},
			clonedC3 = jQuery.extend( true, {}, c3Object );

		clonedC3.bindto = null;
		clonedC3.axis.y.tick.format = number_format;
		const stringifiedC3 = JSON.stringify( clonedC3 );

		if (
			containerHeight > 0 &&
			this._lastStringifiedC3 &&
			stringifiedC3 === this._lastStringifiedC3
		) {
			// console.log('Duplicate data, do not re-render');
			this.labelTextChanged();
			this.resizeChart();
			return;
		}

		this._lastStringifiedC3 = stringifiedC3;
		c3Object.onrendered = function() {
			const ticks = this.chartRef.current.querySelectorAll( '.c3-axis-x .tick' );
			for ( let i = 0; i < ticks.length; i++ ) {
				const tick = ticks[ i ],
					text = tick.querySelector( 'text' );
				if ( text.style.display === 'block' ) {
					this.addClassToSVG( tick, 'populated' );
				}
			}

			this.makeLegend( dataObject );
		}.bind( this );
		// Sometimes lines fail to render, due to container having no height. If height is 0, this retries until height is available.
		if ( this._waiting ) {
			if ( containerHeight > 0 ) {
				this.setState( {
					theChart: c3.generate( c3Object ),
				} );
			}
		} else {
			this.setState(
				{
					theChart: c3.generate( c3Object ),
				},
				this.resizeChart
			);
		}

		if ( containerHeight === 0 ) {
			if ( ! this._waiting ) {
				this._tries = 0;
			}

			this._tries++;
			if ( this._tries > 10 ) {
				return;
			}

			this._waiting = true;

			setTimeout(
				function() {
					this.makeChart( chart_data.categories, chart_data.rows, chart_data.type );
				}.bind( this ),
				1000
			);
		} else {
			this._waiting = false;
			this._tries = 0;
			this.labelTextChanged();
			this.resizeChart();
		}
	}
	makeLegend( data ) {
		const { d3, jQuery, theChart } = this.state;
		const { chart_type } = this.props;
		if ( ! theChart ) {
			return;
		}
		const legendItems = [],
			getYAxisOffset = function() {
				const blockLeft = this.chartRef.current.getBoundingClientRect().left,
					axisLeft = this.chartRef.current
						.querySelector( '.c3-axis.c3-axis-y' )
						.getBoundingClientRect().left;

				if ( chart_type === 'pie' || chart_type === 'donut' ) {
					return 0;
				}
				return axisLeft - blockLeft;
			}.bind( this ),
			yAxisOffset = getYAxisOffset();

		jQuery( this.chartRef.current )
			.find( '.top-legend' )
			.remove();

		Object.keys( data.colors ).forEach( function( item ) {
			legendItems.push( item );
		} );
		d3.select( this.chartRef.current )
			.insert( 'div', '.a8c-chart-wrapper' )
			.attr( 'class', 'top-legend' )
			.style( {
				'margin-left': yAxisOffset + 'px',
			} )
			.selectAll( 'span' )
			.data( legendItems )
			.enter()
			.append( 'span' )
			.attr( {
				'data-id': function( id ) {
					return id;
				},
				class: 'top-legend-item',
			} )
			.html( function( id ) {
				return '<span class="legend-label">' + id + '</span>';
			} )
			.each( function( id ) {
				d3.select( this )
					.insert( 'span', ':first-child' )
					.attr( 'class', 'legend-color' )
					.style( {
						'background-color': theChart.color( id ),
					} );
			} );
		this.chartTitleRef.current.style.paddingLeft = yAxisOffset + 'px';
		this.chartTitleRef.current.style.paddingLeft = yAxisOffset + 'px';
	}
	shouldRotate( type ) {
		const { chart_data, jQuery } = this.state;
		const formats = this.getFormats();
		if ( type !== 'timeseries' ) {
			for ( let x = 0; x < chart_data.categories.length; x++ ) {
				if ( chart_data.categories[ x ] && chart_data.categories[ x ].length > 5 ) {
					return true;
				}
			}

			return false;
		}

		if ( ! chart_data ) {
			return false;
		}

		if ( chart_data.format === formats.y || chart_data.format === formats.cy ) {
			return false; // Year-only timeseries never rotate
		}

		return jQuery( this.chartRef.current ).width() < 600;
	}
	makeChartFromData = () => {
		const { chart_data } = this.state;
		if ( ! chart_data || ! this.chartRef.current ) {
			return;
		}
		this.makeChart( chart_data.categories, chart_data.rows, chart_data.type );
	};
	getExistingChartIds() {
		const { theChart } = this.state;

		const chartData = theChart.data(),
			ids = [];

		for ( let i = 0; i < chartData.length; i++ ) {
			ids.push( chartData[ i ].id );
		}

		return ids;
	}
	downloadAndStoreGoogleSheetsData() {
		const { googlesheet_url } = this.props;
		const { loaded, lastLoadedSheet } = this.state;

		if (
			! loaded ||
			! this.validateURL( googlesheet_url ) ||
			googlesheet_url === lastLoadedSheet
		) {
			return;
		}

		this.setState( {
			lastLoadedSheet: googlesheet_url,
		} );
		this.init( googlesheet_url );
	}
	parseData( data ) {
		const { onUpdateColors } = this.props;
		const rows = [];
		let header = [],
			type = 'category';

		for ( let a = 0; a < data.rows.length; a++ ) {
			if ( a === 0 ) {
				header = data.rows[ a ].cells;
				header.shift();
			} else {
				rows.push( data.rows[ a ].cells );
			}
		}
		const timeseriesAssessment = this.assessTimeseries( header );
		if ( timeseriesAssessment ) {
			type = 'timeseries';
			header = timeseriesAssessment.timeseries;
		}
		this.setState(
			{
				chart_data: {
					categories: header,
					rows: rows,
					type: type,
					values: timeseriesAssessment ? timeseriesAssessment.values : null,
					format: timeseriesAssessment ? timeseriesAssessment.format : null,
				},
			},
			this.makeChartFromData
		);
		onUpdateColors( rows );
		this.colors = this.colorsForData( rows, 'array' );
	}
	validateYear( year ) {
		const text = /^[0-9]+$/;
		year = year.replace( ' ', '' );
		if ( year.length !== 4 || ! text.test( year ) ) {
			return false;
		}

		return true;
	}
	assessTimeseries( header ) {
		const { d3 } = this.state;
		const timeseries = [ 'x' ];
		const dateFormatter = d3.time.format( '%Y-%m-%d' );
		let format;

		for ( let i = 0; i < header.length; i++ ) {
			const date = this.validateYear( header[ i ] )
				? new Date( header[ i ], 0, 1 )
				: new Date( header[ i ] );
			if ( date.toString() === 'Invalid Date' || date === NaN ) {
				return false;
			}
			timeseries.push( dateFormatter( date ) );
		}

		const startDate = dateFormatter.parse( timeseries[ 1 ] ),
			endDate = dateFormatter.parse( timeseries[ timeseries.length - 1 ] ),
			culledDates = d3.time
				.scale()
				.domain( [ startDate, endDate ] )
				.ticks( this.maxTimeseriesPoints( timeseries ) ),
			values = [],
			needs = {
				year: true,
				month: false,
				day: false,
				century: false,
			},
			memory = {};
		let minYear = null;
		let maxYear = null;

		for ( let x = 0; x < culledDates.length; x++ ) {
			values.push( dateFormatter( culledDates[ x ] ) );
			const year = culledDates[ x ].getFullYear(),
				month = culledDates[ x ].getMonth(),
				day = culledDates[ x ].getDay();

			if ( ! memory[ year ] ) {
				memory[ year ] = {};
			}

			if ( ! memory[ year ][ month ] ) {
				memory[ year ][ month ] = {};
			}

			memory[ year ][ month ][ day ] = true;
			if ( Object.keys( memory[ year ] ).length > 1 ) {
				needs.month = true;
			}

			if ( Object.keys( memory[ year ][ month ] ).length > 1 ) {
				needs.day = true;
			}

			if ( ! minYear || minYear < year ) {
				minYear = year;
			}

			if ( ! maxYear || maxYear > year ) {
				maxYear = year;
			}
		}

		const formats = this.getFormats();
		if ( minYear <= new Date().getFullYear() - 100 ) {
			needs.century = true;
		}
		if ( needs.day ) {
			format = needs.century ? formats.cdmy : formats.dmy;
		} else if ( needs.month ) {
			format = needs.century ? formats.cmy : formats.my;
		} else {
			format = needs.century ? formats.cy : formats.y;
		}
		return {
			timeseries: timeseries,
			values: values,
			format: format,
		};
	}

	getFormats() {
		return {
			y: '’%y',
			cy: '%Y',
			cmy: '%m/%Y',
			my: '%m/%y',
			dmy: '%m/%d/%y',
			cdmy: '%m/%d/%Y',
		};
	}

	init( url ) {
		const googleDocLoader = new GoogleDocLoader( {
			url: url,
			jQuery: window.jQuery,
			success: function( data ) {
				this.parseData( data );
			}.bind( this ),
		} );
		return googleDocLoader;
	}
	resizeChart = () => {
		const { align } = this.props;
		const { jQuery, theChart } = this.state;
		if ( ! this.chartfulness() ) {
			return;
		}
		const wrapperWidth = jQuery( this.chartRef.current ).width();
		const wrapperHeight = align === 'full' && wrapperWidth > 800 ? 450 : 320;
		theChart.resize( {
			width: wrapperWidth,
			height: wrapperHeight,
		} );
	};
	alignmentChanged() {
		this._lastStringifiedC3 = null;
		this.makeChartFromData();
	}

	graph_libs_ready = () => {
		const { loaded } = this.state;
		if ( loaded ) {
			return;
		}
		this.setState( {
			loaded: true,
			d3: window.d3,
			c3: window.c3,
			jQuery: window.jQuery,
		} );
		this.downloadAndStoreGoogleSheetsData();
	};

	/* Utilities */

	validateURL( url ) {
		return /pubhtml/.test( url ) || /spreadsheets\/d/.test( url ) || /key=/.test( url );
	}
	addClassToSVG( $element, className ) {
		const classList = $element.getAttribute( 'class' ).split( ' ' );
		for ( let x = 0; x < classList.length; x++ ) {
			if ( classList[ x ] === className ) {
				return;
			}
		}

		classList.push( className );
		$element.setAttribute( 'class', classList.join( ' ' ) );
	}
}

Chart.defaultProps = {
	googlesheet_url: '',
	x_axis_label: '',
	y_axis_label: '',
	chart_type: '',
	number_format: '',
	admin: false,
	align: null,
	colors: [],
	onUpdateColors: () => {},
};

export default Chart;
