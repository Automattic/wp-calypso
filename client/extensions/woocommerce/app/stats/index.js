/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import StatsNavigation from './stats-navigation';
import { getSelectedSiteId } from 'state/ui/selectors';
import StatsChart from './stats-chart';

class Stats extends Component {
	render() {
		const { siteId, unit } = this.props;
		const chartQuery = {
			unit,
			date: this.props.moment().format( 'YYYY-MM-DD' ),
			quantity: '30'
		};
		return (
			<Main className="woocommerce stats" wideLayout={ true }>
				<StatsNavigation unit={ unit } type="orders" />
				<StatsChart siteId={ siteId } query={ chartQuery } />
			</Main>
		);
	}
}

const localizedStats = localize( Stats );

export default connect(
	state => {
		return {
			siteId: getSelectedSiteId( state ),
		};
	}
)( localizedStats );
