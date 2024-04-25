import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getSelectedDomain } from 'calypso/lib/domains';

const TransferLock = ( props ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const { transferAwayEligibleAt } = getSelectedDomain( props );

	return (
		<div>
			<Card className="transfer-out__card">
				{ translate(
					'Due to recent contact information updates, ' +
						'this domain has a transfer lock that expires on {{strong}}%(date)s{{/strong}}. ' +
						'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						args: {
							date: moment( transferAwayEligibleAt ).format( 'LL' ),
						},
						components: {
							strong: <strong />,
							learnMoreLink: (
								<a
									href={ localizeUrl( UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</Card>
		</div>
	);
};

export default TransferLock;
