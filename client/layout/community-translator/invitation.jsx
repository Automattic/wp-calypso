/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import invitationUtils from './invitation-utils';
import { ga as googleAnalytics } from 'lib/analytics';

class CommunityTranslatorInvitation extends React.Component {
	static displayName = 'CommunityTranslatorInvitation';

	static propTypes = {
		isVisible: PropTypes.bool,
	};

	render() {
		if ( ! this.props.isVisible ) {
			return null;
		}

		invitationUtils.recordInvitationDisplayed();

		const subComponents = {
			title: this.props.translate( 'Translate WordPress.com as you go' ),
			acceptButtonText: this.props.translate( 'Try it now!' ),
			dismissButtonText: this.props.translate( 'No thanks' ),
			content: this.props.translate(
				'Help translate the WordPress.com dashboard into your' +
					' native language using the Community Translator tool. ' +
					'{{docsLink}}Find out more{{/docsLink}}. ',
				{
					components: {
						docsLink: (
							<a
								target="_blank"
								rel="noopener noreferrer"
								className="community-translator__translator-invitation__link"
								href="https://en.support.wordpress.com/community-translator/"
								onClick={ this.docsLink }
							/>
						),
					},
				}
			),
		};

		return (
			<div className="community-translator__translator-invitation welcome-message">
				<div className="community-translator__translator-invitation__primary-content">
					<h3 className="community-translator__translator-invitation__title">
						{ subComponents.title }
					</h3>

					<div className="community-translator__translator-invitation__secondary-content">
						<p className="community-translator__translator-invitation__intro">
							{ subComponents.content }
						</p>
						<div className="community-translator__translator-invitation__actions">
							<button
								type="button"
								className="community-translator__action button is-primary"
								onClick={ this.acceptButton }
							>
								{ subComponents.acceptButtonText }
							</button>
							<button
								type="button"
								className="community-translator__action button"
								onClick={ this.dismissButton }
							>
								{ subComponents.dismissButtonText }
							</button>
						</div>
					</div>
				</div>
				<Gridicon
					className="community-translator__translator-invitation__decoration"
					icon="globe"
				/>
			</div>
		);
	}

	acceptButton = () => {
		recordEvent( 'Clicked Accept Button' );
		invitationUtils.activate();
	};

	dismissButton = () => {
		recordEvent( 'Clicked Dismiss Button' );
		invitationUtils.dismiss();
	};

	docsLink = () => {
		recordEvent( 'More Info' );
		invitationUtils.recordDocsEvent();
	};
}

export default localize( CommunityTranslatorInvitation );

function recordEvent( eventAction ) {
	googleAnalytics.recordEvent( 'Translator Invitation', eventAction );
}
