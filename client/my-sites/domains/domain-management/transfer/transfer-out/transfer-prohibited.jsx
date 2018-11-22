/**
 *  External Dependencies
 *
 * @format
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { TRANSFER_DOMAIN_REGISTRATION } from 'lib/url/support';

const TransferProhibited = ( { translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Transfer Domain' ) } />
		<Card className="transfer-card">
			{ translate(
				'It is only possible to transfer a domain after 60 days after the registration date. This 60 day lock is ' +
					'required by the Internet Corporation for Assigned Names and Numbers (ICANN) and cannot be waived. ' +
					'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: (
							<a href={ TRANSFER_DOMAIN_REGISTRATION } target="_blank" rel="noopener noreferrer" />
						),
					},
				}
			) }
		</Card>
	</div>
);

export default localize( TransferProhibited );
