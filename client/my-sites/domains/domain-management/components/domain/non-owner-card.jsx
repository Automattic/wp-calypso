/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { getSelectedDomain } from 'lib/domains';

const NonOwnerCard = ( { domains, selectedDomainName, translate } ) => {
	const domain = getSelectedDomain( { domains, selectedDomainName } );

	return (
		<Notice
			status="is-warning"
			showDismiss={ false }
			text={ translate( 'These settings can be changed by the user {{strong}}%(owner)s{{/strong}}.', {
				components: {
					strong: <strong />
				},
				args: {
					owner: domain.owner
				}
			} ) }
		/>
	);
};

export default localize( NonOwnerCard );
