/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { throttle, map, uniq } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { loadScript } from 'lib/load-script';
import StatsModulePlaceholder from '../stats-module/placeholder';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSiteStatsNormalizedData
} from 'state/stats/lists/selectors';

class StatsGeochart extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
		data: PropTypes.array,
	};

	visualizationsLoaded = false;
	visualization = null;

	componentDidMount() {
		if ( ! window.google ) {
			loadScript( 'https://www.google.com/jsapi' );
			this.tick();
		} else {
			// google jsapi is in the dom, load the visualizations again just in case
			this.loadVisualizations();
		}

		this.resize = throttle( this.resize, 1000 );
		window.addEventListener( 'resize', this.resize );
	}

	componentDidUpdate() {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	}

	componentWillUnmount() {
		if ( this.visualization ) {
			window.google.visualization.events.removeListener( this.visualization, 'regionClick', this.recordEvent );
			this.visualization.clearChart();
		}
		if ( this.resize.cancel ) {
			this.resize.cancel();
		}
		window.removeEventListener( 'resize', this.resize );
	}

	recordEvent = () => {
		analytics.ga.recordEvent( 'Stats', 'Clicked Country on Map' );
	}

	drawRegionsMap = () => {
		if ( this.refs && this.refs.chart ) {
			this.visualizationsLoaded = true;
			this.visualization = new window.google.visualization.GeoChart( this.refs.chart );
			window.google.visualization.events.addListener( this.visualization, 'regionClick', this.recordEvent );

			this.drawData();
		}
	}

	resize = () => {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	}

	drawData = () => {
		const { data, translate } = this.props;

		if ( ! data || ! data.length ) {
			return;
		}

		const mapData = map( data, ( country ) => {
			return [ country.label, country.value ];
		} );
		mapData.unshift( [
			translate( 'Country' ).toString(),
			translate( 'Views' ).toString()
		] );

		const chartData = window.google.visualization.arrayToDataTable( mapData );
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

		const regions = uniq( map( data, 'region' ) );

		if ( 1 === regions.length ) {
			options.region = regions[ 0 ];
		}

		this.visualization.draw( chartData, options );
	}

	loadVisualizations = () => {
		// If google is already in the DOM, don't load it again.
		if ( window.google ) {
			window.google.load( 'visualization', '1', { packages: [ 'geochart' ], callback: this.drawRegionsMap } );
			clearTimeout( this.timer );
		} else {
			this.tick();
		}
	}

	tick = () => {
		this.timer = setTimeout( this.loadVisualizations, 1000 );
	}

	render() {
		const { siteId, statType, query, data } = this.props;
		const isLoading = ! data;
		const classes = classNames( 'stats-geochart', {
			'is-loading': isLoading,
			'has-no-data': data && ! data.length
		} );

		return (
			<div>
				<div ref="chart" className={ classes } />
				{ siteId && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				<StatsModulePlaceholder className="is-block" isLoading={ isLoading } />
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const statType = 'statsCountryViews';
	const { query } = ownProps;

	return {
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		statType,
	};
} )( localize( StatsGeochart ) );
