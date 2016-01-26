/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import throttle from 'lodash/function/throttle';

/**
 * Internal dependencies
 */
import analytics from 'analytics';

export default React.createClass( {
	displayName: 'StatsGeochart',

	visualizationsLoaded: false,

	visualization: null,

	propTypes: {
		data: PropTypes.array.isRequired,
		dataList: PropTypes.object.isRequired
	},

	componentDidMount() {
		const domNode = this.refs.chart;
		const script = document.createElement( 'script' );

		script.src = 'https://www.google.com/jsapi';

		if ( ! window.google ) {
			domNode.appendChild( script );
			this.tick();
		} else {
			// google jsapi is in the dom, load the visualizations again just in case
			this.loadVisualizations();
		}

		this.resize = throttle( this.resize, 1000 );
		window.addEventListener( 'resize', this.resize );
	},

	componentDidUpdate() {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	},

	componentWillUnmount() {
		if ( this.visualization ) {
			window.google.visualization.events.removeListener( this.visualization, 'regionClick', this.recordEvent );
			this.visualization.clearChart();
		}
		if ( this.resize.cancel ) {
			this.resize.cancel();
		}
		window.removeEventListener( 'resize', this.resize );
	},

	recordEvent() {
		analytics.ga.recordEvent( 'Stats', 'Clicked Country on Map' );
	},

	drawRegionsMap() {
		if ( this.isMounted() ) {
			this.visualizationsLoaded = true;
			this.visualization = new window.google.visualization.GeoChart( this.refs.chart );
			window.google.visualization.events.addListener( this.visualization, 'regionClick', this.recordEvent );

			this.drawData();
		}
	},

	resize() {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	},

	drawData() {
		const regionCodes = [];
		const { data, dataList } = this.props;

		if ( data.length ) {
			const chartData = window.google.visualization.arrayToDataTable( data );
			const node = this.refs.chart;
			const width = node.clientWidth;

			const options = {
				width: 100 + '%',
				height: width <= 480 ? '238' : '480',
				keepAspectRatio: true,
				enableRegionInteractivity: true,
				region: 'world',
				colorAxis: { colors: [ '#FFF088', '#F34605' ] }
			};

			dataList.response.data.map( function( country ) {
				if ( -1 === regionCodes.indexOf( country.region ) ) {
					regionCodes.push( country.region );
				}
			} );

			if ( 1 === regionCodes.length ) {
				options.region = regionCodes[ 0 ];
			}

			this.visualization.draw( chartData, options );
		}
	},

	loadVisualizations() {
		// If google is already in the DOM, don't load it again.
		if ( window.google ) {
			window.google.load( 'visualization', '1', { packages: [ 'geochart' ], callback: this.drawRegionsMap } );
			clearTimeout( this.timer );
		} else {
			this.tick();
		}
	},

	tick() {
		this.timer = setTimeout( this.loadVisualizations, 1000 );
	},

	render() {
		return <div ref="chart" className="stats-geochart" />;
	}
} );
