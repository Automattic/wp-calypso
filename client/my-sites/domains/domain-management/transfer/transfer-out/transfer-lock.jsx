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
import { UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES } from 'lib/url/support';
import { getSelectedDomain } from 'lib/domains';

const TransferLock = props => {
	const { translate } = props;
	const { transferAwayEligibleAtMoment } = getSelectedDomain( props );

	return (
		<div>
			<SectionHeader label={ translate( 'Transfer Domain' ) } />
			<Card className="transfer-out__card">
				{ translate(
					'Due to recent contact information updates, ' +
						'this domain has a transfer lock that expires on {{strong}}%(date)s{{/strong}}. ' +
						'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
					{
						args: {
							date: transferAwayEligibleAtMoment.format( 'LL' ),
						},
						components: {
							strong: <strong />,
							learnMoreLink: (
								<a
									href={ UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES }
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

export default localize( TransferLock );
