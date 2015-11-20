/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const EditContactInfoPrivacyEnabledCard = React.createClass( {
	render() {
		return (
			<Card className="edit-contact-info-privacy-enabled-card">
				<p className="edit-contact-info-privacy-enabled-card__settings-explanation">
					{ this.translate(
						'This domain is currently using Privacy Protection to keep your information from showing up in public record searches. ' +
						'If you need to make a change to your domain\'s contact info, please {{a}}contact support{{/a}}.',
						{
							components: {
								a: <a href="https://support.wordpress.com/contact" target="_blank" />
							}
						}
					) }
				</p>
			</Card>
		);
	}
} );

export default EditContactInfoPrivacyEnabledCard;
