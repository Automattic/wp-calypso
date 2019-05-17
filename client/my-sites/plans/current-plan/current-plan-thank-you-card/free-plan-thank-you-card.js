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

export class FreePlanThankYouCard extends Component {
	render() {
		const { siteSlug, translate } = this.props;
		return (
			<Card className="current-plan-thank-you-card__main">
				<div className="current-plan-thank-you-card__content">
					<img
						className="current-plan-thank-you-card__illustration"
						alt=""
						aria-hidden="true"
						src="/calypso/images/illustrations/security.svg"
					/>
					<h1 className="current-plan-thank-you-card__title">
						{ translate( 'Welcome to Jetpack Free!' ) }
					</h1>
					<p>
						{ translate( 'We’ve automatically begun to protect your site from attacks.' ) }
						<br />
						{ translate( "You're now ready to finish the rest of the checklist." ) }
					</p>
					<Button primary href={ `/plans/my-plan/${ siteSlug }` }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

export default connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( FreePlanThankYouCard ) );
