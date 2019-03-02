/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import { domainManagementEmail } from 'my-sites/domains/paths';

const EmailForwardingGSuiteDetails = ( { selectedDomainName, siteSlug, translate } ) => {
	return (
		<Card>
			<p className="email-forwarding__explanation">
				{ translate(
					'You are using G Suite with this domain. {{gsuiteLink}}Manage it here{{/gsuiteLink}}.',
					{
						components: {
							gsuiteLink: <a href={ domainManagementEmail( siteSlug, selectedDomainName ) } />,
						},
					}
				) }
			</p>
		</Card>
	);
};

EmailForwardingGSuiteDetails.propTypes = {
	selectedDomainName: PropTypes.string.isRequired,
	siteSlug: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( EmailForwardingGSuiteDetails );
