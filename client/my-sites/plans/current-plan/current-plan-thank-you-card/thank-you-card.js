/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

export class ThankYouCard extends Component {
	render() {
		const { children, illustration, siteSlug, showContinueButton, title, translate } = this.props;

		return (
			<Card className="current-plan-thank-you-card__main">
				<div className="current-plan-thank-you-card__content">
					{ illustration && (
						<img
							alt=""
							aria-hidden="true"
							className="current-plan-thank-you-card__illustration"
							src={ illustration }
						/>
					) }
					{ title && <h1 className="current-plan-thank-you-card__title">{ title }</h1> }
					{ children }
					{ showContinueButton && (
						<Button primary href={ `/plans/my-plan/${ siteSlug }` }>
							{ translate( 'Continue' ) }
						</Button>
					) }
				</div>
			</Card>
		);
	}
}

export default connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( ThankYouCard ) );
