/**
 * External dependencies
 **/
import React from 'react';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize, moment } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

export const StatsModuleSummaryLinks = props => {
	const { translate, path, siteSlug, query } = props;

	const now = moment();
	const quarter = moment().startOf( 'quarter' );
	const daysSinceQuarterStart = now.diff( quarter, 'd' );
	const options = [
		{ value: '0', label: translate( 'Summary Views' ) },
		{ value: '7', label: translate( 'Last 7 Days' ) },
		{ value: '30', label: translate( 'Last 30 Days' ) },
		{ value: `${ daysSinceQuarterStart }`, label: translate( 'This Quarter' ) },
		{ value: '-1', label: translate( 'All Time' ) }
	];

	const onSelect = ( item ) => {
		if ( item.value !== '0' ) {
			page( `/stats/day/${ path }/${ siteSlug }?startDate=${ moment().format( 'YYYY-MM-DD' ) }&summarize=1&num=${ item.value }` );
		}
	};

	return (
		<SelectDropdown
			compact={ true }
			initialSelected={ query.num }
			options={ options }
			onSelect={ onSelect } />
	);
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );

	return { siteSlug };
}, { recordGoogleEvent } );

export default flowRight(
	connectComponent,
	localize
)( StatsModuleSummaryLinks );
