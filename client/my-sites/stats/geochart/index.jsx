import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { throttle, map } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { getEmailStatsNormalizedData } from 'calypso/state/stats/emails/selectors';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';

import './style.scss';

// TODO: Replace with something that better handles responsive design.
// E.g., https://github.com/themustafaomar/jsvectormap

class StatsGeochart extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		statType: PropTypes.string,
		query: PropTypes.object,
		data: PropTypes.array,
		kind: PropTypes.string,
		postId: PropTypes.number,
		skipQuery: PropTypes.bool,
		isLoading: PropTypes.bool,
		numberLabel: PropTypes.string,
	};

	static defaultProps = {
		kind: 'site',
		numberLabel: '',
	};

	state = {
		visualizationsLoaded: false,
	};

	visualization = null;
	chartRef = createRef();

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
		if ( this.state.visualizationsLoaded ) {
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
			this.setState( { visualizationsLoaded: true } );
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
		if ( this.state.visualizationsLoaded ) {
			this.drawData();
		}
	};

	drawData = () => {
		const { currentUserCountryCode, data, translate, numberLabel } = this.props;
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
		chartData.addColumn( 'number', numberLabel || translate( 'Views' ).toString() );
		chartData.addRows( mapData );

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
			keepAspectRatio: true,
			enableRegionInteractivity: true,
			region: 'world',
			colorAxis: { colors: [ chartColorLight, chartColorDark ] },
			domain: currentUserCountryCode,
		};

		const regions = [ ...new Set( map( data, 'region' ) ) ];

		if ( 1 === regions.length ) {
			options.region = regions[ 0 ];
		}

		this.visualization?.draw( chartData, options );
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
		const { siteId, statType, query, data, kind, skipQuery, isLoading } = this.props;
		// Only pass isLoading when kind is email.
		const isGeoLoading = kind === 'email' ? isLoading : ! data || ! this.state.visualizationsLoaded;
		const classes = clsx( 'stats-geochart', {
			'is-loading': isGeoLoading,
			'has-no-data': data && ! data.length,
		} );

		return (
			<>
				{ ! skipQuery && siteId && kind === 'site' && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }

				<div ref={ this.chartRef } className={ classes } />
				<StatsModulePlaceholder
					className={ clsx( classes, 'is-block' ) }
					isLoading={ isGeoLoading }
				/>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const statType = ownProps.statType ?? 'statsCountryViews';
	const { postId, query, kind } = ownProps;

	const data =
		kind === 'email'
			? getEmailStatsNormalizedData(
					state,
					siteId,
					postId,
					query.period,
					statType,
					query.date,
					'countries'
			  )
			: getSiteStatsNormalizedData( state, siteId, statType, query );

	return {
		currentUserCountryCode: getCurrentUserCountryCode( state ),
		data,
		siteId,
		statType,
	};
} )( localize( StatsGeochart ) );
