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
	state = {
		reasonSelected: null,
	};

	renderFollowUp() {
		// placeholder
		return <Card className="disconnect-site__question">{ 'follow-up' }</Card>;
	}

	handleAnswerClick = event => {
		this.setState( {
			reasonSelected: event.currentTarget.dataset.reason,
		} );
	};

	getOptions() {
		const { isPaidPlan, translate } = this.props;

		const options = [
			{ value: 'tooHard', label: translate( 'It was too hard to configure Jetpack' ) },
			{ value: 'didNotInclude', label: translate( 'This plan didn’t include what I needed' ) },
		];

		if ( isPaidPlan ) {
			options.push( { value: 'tooExpensive', label: translate( 'This plan is too expensive' ) } );
		}
		return options;
	}

	renderEntryQuestion() {
		const { translate, siteId, siteSlug } = this.props;
		const options = this.getOptions();

		return (
			<div>
				<QuerySitePlans siteId={ siteId } />
				<Card className="disconnect-site__question">
					{ translate(
						'Would you mind sharing why you want to disconnect %(siteName)s from WordPress.com ',
						{
							args: { siteName: siteSlug },
						}
					) }
				</Card>
				{ options.map( ( { label, value } ) => (
					<CompactCard
						data-reason={ value }
						href="#"
						key={ value }
						onClick={ this.handleAnswerClick }
						className="disconnect-site__survey-one"
					>
						{ label }
					</CompactCard>
				) ) }
			</div>
		);
	}

	render() {
		const { reasonSelected } = this.state;
		return (
			<div className="disconnect-site__survey main">
				{ reasonSelected ? this.renderFollowUp( reasonSelected ) : this.renderEntryQuestion() }
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
