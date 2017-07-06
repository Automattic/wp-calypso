/**
 * External dependencies
 */
import React from 'react' ;

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getTld } from 'lib/domains';
import EmptyContent from 'components/empty-content';

const MaintenanceCard = ( { selectedDomainName, translate } ) => {
	const tld = getTld( selectedDomainName );

	return (
		<EmptyContent
			title={ translate( '{{strong}}.%(tld)s{{/strong}} is undergoing maintenance', {
				components: { strong: <strong /> },
				args: { tld }
			} ) }
			line={ translate( 'No changes are allowed during that time. Please check back shortly.' ) }
			illustration={ '/calypso/images/drake/drake-whoops.svg' } />
	);
};

export default localize( MaintenanceCard );
