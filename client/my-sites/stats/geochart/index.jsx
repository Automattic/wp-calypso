import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { throttle, map } from 'lodash';
import moment from 'moment';
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
		geoMode: PropTypes.string,
		kind: PropTypes.string,
		postId: PropTypes.number,
		skipQuery: PropTypes.bool,
		isLoading: PropTypes.bool,
		numberLabel: PropTypes.string,
		customHeight: PropTypes.number,
		isRealTime: PropTypes.bool,
		minutesLimit: PropTypes.number,
	};

	static defaultProps = {
		geoMode: 'country',
		kind: 'site',
		numberLabel: '',
		valueField: 'value',
		minutesLimit: 30,
		isRealTime: false,
	};

	state = {
		visualizationsLoaded: false,
		// For real-time data.
		diffData: [],
		dataHistory: [],
		lastUpdated: null,
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
			// Process real-time data from stats normalized data.
			if ( this.props.isRealTime ) {
				this.processRealtimeData();
			}
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

	// TODO: Unify this with the same function in StatsModule.
	updateHistory( history, data ) {
		// Timestamp the new data snapshot.
		const now = moment();
		const newSnapshot = {
			timestamp: now,
			data: data,
		};

		// Filter out snapshots older than minutesLimit prop.
		// This determines the baseline for the diff calculation.
		const { minutesLimit } = this.props;
		const filteredHistory = [ ...history, newSnapshot ].filter(
			( snapshot ) => now.diff( snapshot.timestamp, 'minutes' ) <= minutesLimit
		);

		return this.compactHistory( filteredHistory );
	}

	// TODO: Unify this with the same function in StatsModule.
	compactHistory( history ) {
		const MAX_HISTORY_LENGTH = 35;

		if ( history.length > MAX_HISTORY_LENGTH ) {
			// Keep every other entry to keep memory usage low.
			return history.filter( ( _, index ) => index % 2 === 0 );
		}

		return history;
	}

	// TODO: Unify this with the same function in StatsModule.
	calculateDiff( history, statType ) {
		const key = this.getKeyForStatType( statType );
		const baselineMap = this.createBaselineLookupMap( history, key );
		const lastSnapshot = history[ history.length - 1 ].data;

		return lastSnapshot.map( ( item ) => {
			const baselineItem = baselineMap.get( item[ key ] ) || { value: 0 };
			return {
				...item,
				diffValue: item.value - baselineItem.value,
			};
		} );
	}

	// TODO: Unify this with the same function in StatsModule.
	createBaselineLookupMap( history, key = 'id' ) {
		const lookup = new Map();

		history.forEach( ( snapshot ) => {
			snapshot.data.forEach( ( item ) => {
				if ( ! lookup.has( item[ key ] ) ) {
					lookup.set( item[ key ], item );
				}
			} );
		} );

		return lookup;
	}

	// TODO: Unify this with the same function in StatsModule.
	getKeyForStatType( statType ) {
		// Provided data is not consistent across modules.
		// Ideally we'd have an interface with some common properties.
		// For now we can't assume an 'id' for all stats types.
		// Use this function to find the best available key for unique identification.
		const keys = {
			statsTopPosts: 'id',
			statsReferrers: 'label',
			statsCountryViews: 'countryCode',
		};
		return keys[ statType ] || 'id';
	}

	// TODO: Better manage the real-time data state across components.
	processRealtimeData = () => {
		const { data, statType } = this.props;
		const { dataHistory, lastUpdated } = this.state;
		const UPDATE_THRESHOLD_IN_SECONDS = 15;
		const now = moment();

		if ( ! lastUpdated || now.diff( lastUpdated, 'seconds' ) >= UPDATE_THRESHOLD_IN_SECONDS ) {
			// Some special data index keys depend on the statType.
			const updatedHistory = this.updateHistory( dataHistory, data );
			const diffData = this.calculateDiff( updatedHistory, statType );

			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( {
				diffData,
				dataHistory: updatedHistory,
				lastUpdated: now,
			} );
		}
	};

	remapData() {
		const { valueField, isRealTime } = this.props;
		const data = isRealTime ? this.state.diffData : this.props.data;

		// TODO: Handle items with children.
		// For now, we remove any children to avoid view counts out of context.

		if ( isRealTime ) {
			return data
				.filter( ( item ) => item.diffValue !== 0 )
				.sort( ( a, b ) => {
					// Primary sort: diffValue (high to low)
					if ( b.diffValue !== a.diffValue ) {
						return b.diffValue - a.diffValue;
					}
					// Secondary sort: label (alphabetically)
					return ( a.label || '' ).localeCompare( b.label || '' );
				} )
				.map( ( item ) => ( {
					...item,
					value: item.diffValue || 0,
					children: null,
				} ) );
		}

		if ( valueField && data ) {
			return data.map( ( item ) => ( {
				...item,
				value: item[ valueField ],
			} ) );
		}

		return [];
	}

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

	/**
	 * Prepare data for Google GeoChart.
	 * @param {Array} data - The data to prepare.
	 * @returns {Object} chartData - The prepared data.
	 */
	prepareChartData = ( data ) => {
		const { geoMode, numberLabel, translate } = this.props;
		const chartData = new window.google.visualization.DataTable();

		// City mode: displays individual cities as markers on the map.
		// Uses latitude/longitude coordinates to place markers.
		if ( geoMode === 'city' ) {
			chartData.addColumn( 'number', 'Latitude' );
			chartData.addColumn( 'number', 'Longitude' );
			chartData.addColumn( 'string', 'Location' );
			chartData.addColumn( 'number', numberLabel || translate( 'Views' ).toString() );

			chartData.addRows(
				data.reduce( ( filteredLocations, location ) => {
					if ( location.coordinates ) {
						filteredLocations.push( [
							Number( location.coordinates.latitude ),
							Number( location.coordinates.longitude ),
							location.label,
							location.value,
						] );
					}

					return filteredLocations;
				}, [] )
			);

			return chartData;
		}

		// Region mode: groups regions by country, showing aggregated country data
		// with tooltips displaying the top regions within each country.
		// @TODO: once we have the region coordinates available through the API, we could
		// get rid of this block and use the same as city mode.
		if ( geoMode === 'region' ) {
			chartData.addColumn( 'string', 'Location' );
			chartData.addColumn( 'number', 'Views' );
			chartData.addColumn( { type: 'string', role: 'tooltip', p: { html: true } } );

			const groupedLocations = data.reduce( ( acc, location ) => {
				const countryCode = location.countryCode || 'unknown';
				if ( ! acc[ countryCode ] ) {
					acc[ countryCode ] = [];
				}
				acc[ countryCode ].push( location );
				return acc;
			}, {} );

			// Create rows for each country with tooltip showing top regions
			const rows = Object.entries( groupedLocations ).map( ( [ countryCode, locations ] ) => {
				// Take top 10 locations
				const topLocations = locations.slice( 0, 10 );

				// Create HTML tooltip content
				const tooltipContent = this.createRegionTooltip( topLocations, locations.length );

				return [
					{
						v: countryCode,
						f: locations[ 0 ].countryFull || countryCode,
					},
					locations[ 0 ].value || 0,
					tooltipContent,
				];
			} );

			chartData.addRows( rows );
			return chartData;
		}

		// Country mode (default): displays data by country across the world map.
		// Each country is colored based on its view count.
		chartData.addColumn( 'string', 'Location' );
		chartData.addColumn( 'number', numberLabel || translate( 'Views' ).toString() );
		chartData.addRows(
			map( data, ( location ) => {
				return [
					{
						v: location.countryCode,
						f: location.label,
					},
					location.value,
				];
			} )
		);

		return chartData;
	};

	/**
	 * Creates an HTML tooltip for region view
	 * @param {Array} topLocations - Top locations to show in tooltip
	 * @param {number} totalLocations - Total number of locations
	 * @returns {string} HTML tooltip content
	 */
	createRegionTooltip = ( topLocations, totalLocations ) => {
		const { translate } = this.props;
		const moreLocationsText = translate( '…and %d more locations', {
			args: [ totalLocations - 10 ],
		} );

		const items = topLocations
			.map( ( location ) => `${ location.label }: ${ location.value.toLocaleString() }` )
			.join( '<br />' );

		return totalLocations > 10 ? `${ items }<br />${ moreLocationsText }` : items;
	};

	drawData = () => {
		const { currentUserCountryCode, geoMode, customHeight } = this.props;
		// Determine if we should use real-time data or normalized data.
		const data = this.remapData();
		if ( ! data || ! data.length ) {
			return;
		}

		const chartData = this.prepareChartData( data );
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

		if ( geoMode === 'city' ) {
			options.displayMode = 'markers';
		}

		if ( geoMode === 'region' ) {
			options.tooltip = { trigger: 'focus', isHtml: true };
		}

		if ( customHeight ) {
			options.height = customHeight;
		}

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
		const { siteId, statType, query, kind, skipQuery, isLoading } = this.props;
		const data = this.remapData();
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
	const currentUserCountryCode = getCurrentUserCountryCode( state );
	const { postId, query, kind } = ownProps;

	// Skip data fetching if it was explicitly passed as a prop
	if ( ownProps.data ) {
		return {
			currentUserCountryCode,
			data: ownProps.data,
			siteId,
			statType,
		};
	}

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
		currentUserCountryCode,
		data,
		siteId,
		statType,
	};
} )( localize( StatsGeochart ) );
