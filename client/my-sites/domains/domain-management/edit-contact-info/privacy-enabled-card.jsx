/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { domainManagementContactsPrivacy } from 'calypso/my-sites/domains/paths';
import PropTypes from 'prop-types';

/**
 * Style dependencies
 */
import './privacy-enabled-card.scss';

function EditContactInfoPrivacyEnabledCard( { selectedDomainName, selectedSiteSlug } ) {
	const translate = useTranslate();

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
									href={ domainManagementContactsPrivacy( selectedSiteSlug, selectedDomainName ) }
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

EditContactInfoPrivacyEnabledCard.propTypes = {
	selectedDomainName: PropTypes.string.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

export default EditContactInfoPrivacyEnabledCard;
