/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { throttle, map, uniq } from 'lodash';
import { connect } from 'react-redux';
import { loadScript } from '@automattic/load-script';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { gaRecordEvent } from 'lib/analytics/ga';
import config from 'config';
import StatsModulePlaceholder from '../stats-module/placeholder';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class StatsGeochart extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
		data: PropTypes.array,
	};

	visualizationsLoaded = false;
	visualization = null;
	chartRef = React.createRef();

	componentDidMount() {
		if ( ! window.google || ! window.google.charts ) {
			loadScript( 'https://www.gstatic.com/charts/loader.js' );
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
			window.google.visualization.events.removeListener(
				this.visualization,
				'regionClick',
				this.recordEvent
			);
			this.visualization.clearChart();
		}
		if ( this.resize.cancel ) {
			this.resize.cancel();
		}
		window.removeEventListener( 'resize', this.resize );
	}

	recordEvent = () => {
		gaRecordEvent( 'Stats', 'Clicked Country on Map' );
	};

	drawRegionsMap = () => {
		if ( this.chartRef.current ) {
			this.visualizationsLoaded = true;
			this.visualization = new window.google.visualization.GeoChart( this.chartRef.current );
			window.google.visualization.events.addListener(
				this.visualization,
				'regionClick',
				this.recordEvent
			);

			this.drawData();
		}
	};

	resize = () => {
		if ( this.visualizationsLoaded ) {
			this.drawData();
		}
	};

	drawData = () => {
		const { currentUserCountryCode, data, translate } = this.props;

		if ( ! data || ! data.length ) {
			return;
		}

		const mapData = map( data, ( country ) => {
			return [
				{
					v: country.countryCode,
					f: country.label,
				},
				country.value,
			];
		} );

		const chartData = new window.google.visualization.DataTable();
		chartData.addColumn( 'string', translate( 'Country' ).toString() );
		chartData.addColumn( 'number', translate( 'Views' ).toString() );
		chartData.addRows( mapData );
		const node = this.chartRef.current;
		const width = node.clientWidth;

		// Note that using raw hex values here is an exception due to
		// IE11 and other older browser not supporting CSS custom props.
		// We have to set values to Google GeoChart via JS. We don't
		// support switching color schemes in IE11 thus applying the
		// defaults as raw hex values here.
		const chartColorLight =
			getComputedStyle( document.body ).getPropertyValue( '--color-accent-5' ).trim() || '#ffdff3';
		const chartColorDark =
			getComputedStyle( document.body ).getPropertyValue( '--color-accent' ).trim() || '#d52c82';

		const options = {
			width: 100 + '%',
			height: width <= 480 ? '238' : '480',
			keepAspectRatio: true,
			enableRegionInteractivity: true,
			region: 'world',
			colorAxis: { colors: [ chartColorLight, chartColorDark ] },
			domain: currentUserCountryCode,
		};

		const regions = uniq( map( data, 'region' ) );

		if ( 1 === regions.length ) {
			options.region = regions[ 0 ];
		}

		this.visualization.draw( chartData, options );
	};

	loadVisualizations = () => {
		// If google is already in the DOM, don't load it again.
		if ( window.google && window.google.charts ) {
			window.google.charts.load( '45', {
				packages: [ 'geochart' ],
				mapsApiKey: config( 'google_maps_and_places_api_key' ),
			} );
			window.google.charts.setOnLoadCallback( this.drawRegionsMap );
			clearTimeout( this.timer );
		} else {
			this.tick();
		}
	};

	tick = () => {
		this.timer = setTimeout( this.loadVisualizations, 1000 );
	};

	render() {
		const { siteId, statType, query, data } = this.props;
		const isLoading = ! data;
		const classes = classNames( 'stats-geochart', {
			'is-loading': isLoading,
			'has-no-data': data && ! data.length,
		} );

		return (
			<div>
				<div ref={ this.chartRef } className={ classes } />
				{ siteId && <QuerySiteStats statType={ statType } siteId={ siteId } query={ query } /> }
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
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
		currentUserCountryCode: getCurrentUserCountryCode( state ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
		siteId,
		statType,
	};
} )( localize( StatsGeochart ) );
