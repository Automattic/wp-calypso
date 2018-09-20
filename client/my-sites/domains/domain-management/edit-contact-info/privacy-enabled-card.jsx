/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { CALYPSO_CONTACT } from 'lib/url/support';

class EditContactInfoPrivacyEnabledCard extends React.Component {
	render() {
		return (
			<Card className="edit-contact-info-privacy-enabled-card">
				<p className="edit-contact-info-privacy-enabled-card__settings-explanation">
					{ this.props.translate(
						'This domain is currently using Privacy Protection to keep your information from showing up in public record searches. ' +
							"If you need to make a change to your domain's contact info, please {{a}}contact support{{/a}}.",
						{
							components: {
								a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
							},
						}
					) }
				</p>
			</Card>
		);
	}
}

export default localize( EditContactInfoPrivacyEnabledCard );
