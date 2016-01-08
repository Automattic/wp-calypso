/** External Dependencies */
import React from 'react';

/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

const TransferProhibited = () => (
	<div>
		<SectionHeader label={ translate( 'Transfer Domain' ) } />
		<Card className="transfer-card">
			<p>
				{ translate(
					'It is only possible to transfer a domain after 60 days after the registration date. This 60 day lock is ' +
					'required by the Internet Corporation for Assigned Names and Numbers (ICANN) and cannot be waived. ' +
					'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						components: {
							learnMoreLink: <a href="https://support.wordpress.com/transfer-domain-registration/" target="_blank"/>
						}
					}
				) }
			</p>
		</Card>
	</div>
);

export default TransferProhibited;
