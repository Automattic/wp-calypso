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
import { isDesktop } from 'lib/viewport';
import { preventWidows } from 'lib/formatting';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import Button from 'components/button';

import './style.scss';

export class ThankYouCard extends Component {
	startChecklistTour = () => {
		if ( isDesktop() ) {
			this.props.requestGuidedTour( 'jetpackChecklistTour' );
		}
	};

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
			<div className="current-plan-thank-you">
				{ illustration && (
					<img
						alt=""
						aria-hidden="true"
						className="current-plan-thank-you__illustration"
						src={ illustration }
					/>
				) }
				{ title && <h1 className="current-plan-thank-you__title">{ title }</h1> }
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
					<Button
						href={ `/plans/my-plan/${ siteSlug }` }
						onClick={ this.startChecklistTour }
						primary
					>
						{ translate( 'Continue' ) }
					</Button>
				) }
				{ showHideMessage && (
					<p>
						<a href={ `/plans/my-plan/${ siteSlug }` } onClick={ this.startChecklistTour }>
							{ translate( 'Hide message' ) }
						</a>
					</p>
				) }
			</div>
		);
	}
}

export default connect(
	state => ( {
		siteSlug: getSelectedSiteSlug( state ),
	} ),
	{ requestGuidedTour }
)( localize( ThankYouCard ) );
