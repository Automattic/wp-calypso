/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { getTld } from 'lib/domains';

const MaintenanceCard = ( { selectedDomainName, translate } ) => {
	const tld = getTld( selectedDomainName );

	return (
		<EmptyContent
			title={ translate( '{{strong}}.%(tld)s{{/strong}} is undergoing maintenance', {
				components: { strong: <strong /> },
				args: { tld }
			} ) }
			line={ translate( 'No changes are allowed during that time. Please check back shortly.' ) }
			illustration={ '/calypso/images/illustrations/whoops.svg' } />
	);
};

export default localize( MaintenanceCard );
