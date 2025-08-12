import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { TRANSFER_DOMAIN_REGISTRATION } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

const TransferProhibited = ( { translate } ) => (
	<div>
		<Card className="transfer-out__card">
			{ translate(
				'It is only possible to transfer a domain after 60 days after the registration date. This 60 day lock is ' +
					'required by the Internet Corporation for Assigned Names and Numbers (ICANN) and cannot be waived. ' +
					'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: (
							<InlineSupportLink supportLink={ localizeUrl( TRANSFER_DOMAIN_REGISTRATION ) } />
						),
					},
				}
			) }
		</Card>
	</div>
);

export default localize( TransferProhibited );
