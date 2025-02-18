import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Icon, Button, ButtonGroup } from '@wordpress/components';
import { chartBar, trendingUp } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Legend from 'calypso/components/chart/legend';
import IntervalDropdown from 'calypso/components/stats-interval-dropdown';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import useIntervals from '../hooks/use-intervals';

const ChartHeader = ( {
	siteId,
	slug,
	period,
	queryParams,
	activeTab,
	activeLegend,
	availableLegend,
	onLegendClick,
	charts,
} ) => {
	const intervals = useIntervals( siteId );
	const dispatch = useDispatch();
	const isSiteJetpackNotAtomic = useSelector( ( state ) => {
		return isJetpackSite( state, siteId, {
			treatAtomicAsJetpackSite: false,
		} );
	} );

	const isChartLibraryEnabled = config.isEnabled( 'stats/chart-library' );

	const [ chartType, setChartType ] = useState( 'line' );

	const onGatedHandler = ( events, source, statType ) => {
		// Stop the popup from showing for Jetpack sites.
		if ( isSiteJetpackNotAtomic ) {
			return;
		}

		events.forEach( ( event ) => recordTracksEvent( event.name, event.params ) );
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	const handleChartTypeChange = ( newType ) => {
		setChartType( newType );
		//TODO: add tracks event for chart type change
	};

	return (
		<div className="stats-chart-tabs__header">
			<div className="stats-chart-tabs__header-title">{ activeTab?.label }</div>
			<Legend
				activeCharts={ activeLegend }
				activeTab={ activeTab }
				availableCharts={ availableLegend }
				clickHandler={ onLegendClick }
				tabs={ charts }
			/>
			<IntervalDropdown
				slug={ slug }
				period={ period }
				queryParams={ queryParams }
				intervals={ intervals }
				onGatedHandler={ onGatedHandler }
			/>
			{ isChartLibraryEnabled && (
				<ButtonGroup className="stats-chart-tabs__type-toggle">
					<Button
						icon={ <Icon icon={ trendingUp } /> }
						isSmall
						isPrimary={ chartType === 'line' }
						onClick={ () => handleChartTypeChange( 'line' ) }
						aria-label="Switch to line chart"
					/>
					<Button
						icon={ <Icon icon={ chartBar } /> }
						isSmall
						isPrimary={ chartType === 'bar' }
						onClick={ () => handleChartTypeChange( 'bar' ) }
						aria-label="Switch to bar chart"
					/>
				</ButtonGroup>
			) }
		</div>
	);
};

ChartHeader.propTypes = {
	activeTab: PropTypes.object,
	controls: PropTypes.node,
	activeLegend: PropTypes.arrayOf( PropTypes.string ),
	availableLegend: PropTypes.arrayOf( PropTypes.string ),
	onLegendClick: PropTypes.func,
	charts: PropTypes.array,
};

export default ChartHeader;
