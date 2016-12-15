/**
 * External dependencies
 */
import React from 'react' ;

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { getSelectedDomain } from 'lib/domains';
import Notice from 'components/notice';

const MaintenanceCard = ( { domains, selectedDomainName, translate } ) => {
	const domain = getSelectedDomain( { domains, selectedDomainName } ),
		lastIndexOfDot = domain.name.lastIndexOf( '.' ),
		tld = lastIndexOfDot !== -1 && domain.name.substring( lastIndexOfDot );

	return (
		<Notice
			status="is-info"
			showDismiss={ false }
			text={ translate( 'Domains ending with {{strong}}%(tld)s{{/strong}} are undergoing maintenance, ' +
				'and no changes are allowed during that time. Please check back shortly.', {
					components: { strong: <strong /> },
					args: { tld }
				} ) }
		/>
	);
};

export default localize( MaintenanceCard );
