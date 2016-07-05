/**
 * External dependencies
 */
import React from 'react' ;

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Notice from 'components/notice';

const NonOwnerCard = ( { selectedDomainName, translate } ) => {
	return (
		<Notice
			status="is-warning"
			showDismiss={ false }
			text={ translate( 'These settings can be changed by the user who registered the domain {{strong}}%(domain)s{{/strong}}.', {
				components: {
					strong: <strong />
				},
				args: {
					domain: selectedDomainName
				}
			} ) }
		/>
	);
};

export default localize( NonOwnerCard );
