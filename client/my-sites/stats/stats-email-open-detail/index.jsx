import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import Geochart from 'calypso/my-sites/stats/geochart';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class StatsEmailOpenDetail extends Component {
	render() {
		const { siteId, date, postId, period } = this.props;
		const queryDate = date.format( 'YYYY-MM-DD' );
		return (
			<div>
				Email Stats placeholder
				<Geochart
					kind="email"
					siteId={ siteId }
					postId={ postId }
					query={ { date: queryDate, period } }
				/>
			</div>
		);
	}
}

const connectComponent = connect(
	( state, { postId } ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			postId,
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsEmailOpenDetail );
