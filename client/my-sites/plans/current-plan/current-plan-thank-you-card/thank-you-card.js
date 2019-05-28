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
import { preventWidows } from 'lib/formatting';
import Button from 'components/button';
import Card from 'components/card';

export class ThankYouCard extends Component {
	render() {
		const {
			children,
			illustration,
			showCalypsoIntro,
			showContinueButton,
			showHideMessage,
			siteSlug,
			title,
			translate,
		} = this.props;

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
					{ showCalypsoIntro && (
						<p>
							{ preventWidows(
								translate(
									'This is your new WordPress.com dashboard. You can manage your site ' +
										'here, or return to your self-hosted WordPress dashboard using the ' +
										'link at the bottom of your checklist.'
								)
							) }
						</p>
					) }
					{ showContinueButton && (
						<Button primary href={ `/plans/my-plan/${ siteSlug }` }>
							{ translate( 'Continue' ) }
						</Button>
					) }
					{ showHideMessage && (
						<p>
							<a href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Hide message' ) }</a>
						</p>
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
