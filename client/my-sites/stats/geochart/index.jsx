/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	throttle = require( 'lodash/function/throttle' ),
	debug = require( 'debug' )( 'calypso:stats:geochart' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'StatsGeochart',

	visualizationsLoaded: false,

	visualization: null,

	propTypes: {
		data: React.PropTypes.array.isRequired,
		dataList: React.PropTypes.object.isRequired
	},

	recordEvent: function() {
		analytics.ga.recordEvent( 'Stats', 'Clicked Country on Map' );
	},

	drawRegionsMap: function() {
		if ( this.isMounted() ) {
			debug( 'this should only be called once ' );
			this.visualizationsLoaded = true;
			this.visualization = new window.google.visualization.GeoChart( this.refs.chart );
			window.google.visualization.events.addListener( this.visualization, 'regionClick', this.recordEvent );

			this.drawData();
		}
	},

	resize: function() {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	},

	drawData: function(){
		var regionCodes = [];

		if( this.props.data.length > 1 ) {
			var data = window.google.visualization.arrayToDataTable( this.props.data ),
				node = this.refs.chart,
				width = node.clientWidth,
				options = {
					width: 100 + '%',
					height: width <= 480 ? '238' : '480',
					keepAspectRatio: true,
					enableRegionInteractivity: true,
					region: 'world',
					colorAxis: { colors: [ '#FFF088', '#F34605' ] }
				};

			this.props.dataList.response.data.map( function( country ) {
				if ( -1 === regionCodes.indexOf( country.region ) ) {
					regionCodes.push( country.region );
				}
			} );

			if ( 1 === regionCodes.length ) {
				options.region = regionCodes[ 0 ];
			}

			debug( 'here are the data points ', this.props.data );
			this.visualization.draw( data, options );
		}
	},

	loadVisualizations: function( ){
		// If google is already in the DOM, don't load it again.
		if( window.google ) {
			window.google.load( 'visualization', '1', { packages: [ 'geochart' ], callback: this.drawRegionsMap } );
			clearTimeout( this.timer );
		} else {
			debug('no google');
			this.tick();
		}
	},

	componentDidMount: function() {
		var domNode = this.refs.chart,
			script = document.createElement( 'script' );

		script.src = 'https://www.google.com/jsapi';

		if( ! window.google ) {
			domNode.appendChild( script );
			this.tick();
		} else {
			// google jsapi is in the dom, load the visualizations again just in case
			this.loadVisualizations();
		}

		this.resize = throttle( this.resize, 1000 );
		window.addEventListener( 'resize', this.resize );
	},

	componentDidUpdate: function(){
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	},

	// Remove listener
	componentWillUnmount: function() {
		if ( this.visualization ) {
			window.google.visualization.events.removeListener( this.visualization, 'regionClick', this.recordEvent );
			this.visualization.clearChart();
		}
		if ( this.resize.cancel ) {
			this.resize.cancel();
		}
		window.removeEventListener( 'resize', this.resize );
	},

	tick: function() {
		this.timer = setTimeout( this.loadVisualizations, 1000 );
	},

	render: function() {
		// TODO determine best course of action on responsiveness - or lack thereof - in the map visualization

		return ( <div ref="chart" className="stats-geochart" /> );
	}
} );
