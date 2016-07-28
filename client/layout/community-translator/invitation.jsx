/**
 * External dependencies
 */
import React from 'react';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import invitationUtils from './invitation-utils';
import { ga as googleAnalytics } from 'lib/analytics';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'CommunityTranslatorInvitation',

	propTypes: {
		isVisible: React.PropTypes.bool
	},

	render: function() {
		if ( ! this.props.isVisible ) {
			return null;
		}

		invitationUtils.recordInvitationDisplayed();

		let subComponents = {
			title: this.translate( 'Translate WordPress.com as you go' ),
			acceptButtonText: this.translate( 'Try it now!' ),
			dismissButtonText: this.translate( 'No thanks' ),
			content: this.translate( 'Help translate the WordPress.com dashboard into your' +
			' native language using the Community Translator tool. ' +
			'{{docsLink}}Find out more{{/docsLink}}. ',
				{ components: { docsLink: <a target="_blank"
						className="translator-invitation__link"
						href="https://en.support.wordpress.com/community-translator/"
						onClick={ this.docsLink } /> } } )
		};

		return (
			<div className="translator-invitation welcome-message">
				<div className="translator-invitation__primary-content">
					<h3 className="translator-invitation__title">{ subComponents.title }</h3>

					<div className="translator-invitation__secondary-content">
						<p className="translator-invitation__intro">
							{ subComponents.content }
						</p>
						<div className="translator-invitation__actions">
							<button
								type="button"
								className="button is-primary"
								onClick={ this.acceptButton }>
								{ subComponents.acceptButtonText }
							</button>
							<button
								type="button"
								className="button"
								onClick={ this.dismissButton }>
								{ subComponents.dismissButtonText }
							</button>
						</div>
					</div>
				</div>
				<Gridicon className="translator-invitation__decoration" icon="globe" />
			</div>
		);
	},

	acceptButton: function() {
		recordEvent( 'Clicked Accept Button' );
		invitationUtils.activate();
	},

	dismissButton: function() {
		recordEvent( 'Clicked Dismiss Button' );
		invitationUtils.dismiss();
	},

	docsLink: function() {
		recordEvent( 'More Info' );
		invitationUtils.recordDocsEvent();
	}
} );

function recordEvent( eventAction ) {
	googleAnalytics.recordEvent( 'Translator Invitation', eventAction );
}
