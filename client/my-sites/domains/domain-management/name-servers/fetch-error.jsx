/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

const FetchError = ( { selectedDomainName, translate } ) => {
	return (
		<Notice
			status="is-warning"
			showDismiss={ false }
			text={ translate(
				'Sorry, there was an error fetching the nameservers for {{strong}}%(domain)s{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
					args: {
						domain: selectedDomainName,
					},
				}
			) }
		/>
	);
};

export default localize( FetchError );
