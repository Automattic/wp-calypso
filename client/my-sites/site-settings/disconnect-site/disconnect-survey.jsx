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
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isFreeJetpackPlan } from 'lib/products-values';
import { isJetpackSite } from 'state/sites/selectors';

class DisconnectSurvey extends Component {
	state = {
		reasonSelected: 'tooExpensive',
		renderInitial: true,
	};

	renderFollowUp() {
		// placeholder
		return <Card className="disconnect-site__question">{ 'follow-up' }</Card>;
	}

	handleAnswerClick = option => {
		this.setState( {
			reasonSelected: option.value,
			renderInitial: false,
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
		const { reasonSelected, renderInitial } = this.state;
		return (
			<div className="disconnect-site__survey main">
				{ renderInitial ? this.renderEntryQuestion() : this.renderFollowUp( reasonSelected ) }
			</div>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectSurvey ) );
