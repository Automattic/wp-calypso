/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import {
	domainManagementEditContactInfo,
	domainManagementNameServers,
} from 'calypso/my-sites/domains/paths';
import { TRANSFER_DOMAIN_REGISTRATION } from 'calypso/lib/url/support';

export default function TransferOutWarning( { domainName, selectedSiteSlug } ) {
	return (
		<p>
			{ translate(
				'Most transfers can be completed in a week or less; however depending on your domain it may take longer. Your domain will continue to work, but {{strong}}domain settings such as {{nameserversLink}}name servers{{/nameserversLink}} and {{contactInformationEditLink}}contact information{{/contactInformationEditLink}} cannot be changed during the transfer{{/strong}}. If you need to make changes, please do so before starting the transfer process.',
				{
					components: {
						strong: <strong />,
						nameserversLink: (
							<a
								rel="noopener noreferrer"
								href={ domainManagementNameServers( selectedSiteSlug, domainName ) }
							/>
						),
						contactInformationEditLink: (
							<a
								rel="noopener noreferrer"
								href={ domainManagementEditContactInfo( selectedSiteSlug, domainName ) }
							/>
						),
					},
				}
			) }{ ' ' }
			<a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer">
				{ translate( 'Learn more about domain transfers.' ) }
			</a>
		</p>
	);
}

TransferOutWarning.propTypes = {
	domainName: PropTypes.string.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};
