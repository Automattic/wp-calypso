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
		<Card className="email-forwarding__card">
			<p className="email-forwarding__explanation">
				{ translate(
					"You're using G Suite with this domain, so you'll use that to create custom email addresses. {{a}}Manage your G Suite settings.{{/a}}",
					{
						components: {
							a: <a href={ domainManagementEmail( siteSlug, selectedDomainName ) } />,
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
