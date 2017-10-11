/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import QuerySitePlans from 'components/data/query-site-plans';
import { isSiteOnPaidPlan } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class DisconnectSurvey extends Component {
	getReasons() {
		const { isPaidPlan, translate } = this.props;

		const reasons = [
			{ slug: 'too-difficult', label: translate( 'It was too hard to configure Jetpack' ) },
			{ slug: 'missing-feature', label: translate( 'This plan didn’t include what I needed' ) },
		];

		if ( isPaidPlan ) {
			reasons.push( { slug: 'too-expensive', label: translate( 'This plan is too expensive' ) } );
		}
		return reasons;
	}

	render() {
		const { translate, siteId, siteSlug } = this.props;
		const reasons = this.getReasons();

		return (
			<div className="disconnect-site__survey main">
				<QuerySitePlans siteId={ siteId } />
				<Card className="disconnect-site__question">
					{ translate(
						'Would you mind sharing why you want to disconnect %(siteName)s from WordPress.com ',
						{
							args: { siteName: siteSlug },
						}
					) }
				</Card>
				{ reasons.map( ( { label, slug } ) => (
					<CompactCard
						href={ `/settings/disconnect-site/${ siteSlug }/${ slug }` }
						key={ slug }
						className="disconnect-site__survey-one"
					>
						{ label }
					</CompactCard>
				) ) }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		isPaidPlan: isSiteOnPaidPlan( state, siteId ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( DisconnectSurvey ) );
