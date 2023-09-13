import { Button, Count } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

class SubscribersCount extends Component {
	render() {
		const { slug, subscribers, translate, siteId } = this.props;

		return (
			<div className="subscribers-count">
				{ siteId && <QuerySiteStats statType="stats" siteId={ siteId } /> }
				{ typeof subscribers === 'number' && (
					<Button
						borderless
						href={ '/people/subscribers/' + slug }
						title={ translate( 'Total of WordPress and Email Subscribers' ) }
					>
						{ translate( 'Subscribers' ) }
						<span className="screen-reader-text">:</span> <Count count={ subscribers } />
					</Button>
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	const siteId = get( site, 'ID' );
	const data = getSiteStatsNormalizedData( state, siteId, 'stats' );
	const siteSubscribers = get( site, 'subscribers_count' );

	return {
		slug: getSiteSlug( state, siteId ),
		subscribers: get( data, 'followersBlog', siteSubscribers ),
		siteId,
	};
} )( localize( SubscribersCount ) );
