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
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { isFreeJetpackPlan } from 'lib/products-values';

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
		const { translate, site } = this.props;

		const options = [
			{ value: 'tooHard', label: translate( 'It was too hard to configure Jetpack' ) },
			{ value: 'didNotInclude', label: translate( 'This plan didn’t include what I needed' ) },
		];

		if ( ! isFreeJetpackPlan( site.plan ) ) {
			options.push( { value: 'tooExpensive', label: translate( 'This plan is too expensive' ) } );
		}
		return options;
	}

	renderEntryQuestion() {
		const { translate, siteSlug } = this.props;
		const options = this.getOptions();

		return (
			<div>
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

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSurvey ) );
