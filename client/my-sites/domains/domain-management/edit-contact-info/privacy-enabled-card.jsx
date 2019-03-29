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
import { domainManagementEdit } from 'my-sites/domains/paths';
import PropTypes from 'prop-types';

class EditContactInfoPrivacyEnabledCard extends React.PureComponent {
	static propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		const { selectedDomainName, selectedSite, translate } = this.props;

		return (
			<Card className="edit-contact-info__privacy-enabled-card">
				<p className="edit-contact-info__privacy-enabled-card-settings-explanation">
					{ translate(
						'This domain is currently using Privacy Protection to keep your information from showing up in public record searches. ' +
							"If you need to make a change to your domain's contact info, please {{a}}turn privacy off{{/a}} first.",
						{
							components: {
								a: (
									<a
										href={ domainManagementEdit( selectedSite.slug, selectedDomainName ) }
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
				</p>
			</Card>
		);
	}
}

export default localize( EditContactInfoPrivacyEnabledCard );
