/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { isDesktop } from 'lib/viewport';
import { preventWidows } from 'lib/formatting';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { Button } from '@automattic/components';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import getCurrentRoute from 'state/selectors/get-current-route';
import { addQueryArgs } from 'lib/url';

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
			currentRoute,
			illustration,
			showCalypsoIntro,
			showContinueButton,
			showHideMessage,
			title,
			translate,
		} = this.props;

		const dismissUrl =
			this.props.queryArgs && 'install' in this.props.queryArgs
				? addQueryArgs( { install: this.props.queryArgs.install }, currentRoute )
				: currentRoute;

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
				<div>
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
						<Button href={ dismissUrl } onClick={ this.startChecklistTour } primary>
							{ translate( 'Continue' ) }
						</Button>
					) }
					{ showHideMessage && (
						<p>
							<a
								href={ dismissUrl }
								className="current-plan-thank-you__link"
								onClick={ this.startChecklistTour }
							>
								{ translate( 'Hide message' ) }
							</a>
						</p>
					) }
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		currentRoute: getCurrentRoute( state ),
		queryArgs: getCurrentQueryArguments( state ),
	} ),
	{ requestGuidedTour }
)( localize( ThankYouCard ) );
