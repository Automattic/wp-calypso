import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';

import './style.scss';

export default function EmailHeader() {
	const translate = useTranslate();

	return (
		<div className="email-header">
			<FormattedHeader
				brandFont
				headerText={ translate( 'Emails' ) }
				subHeaderText={ translate(
					'Your home base for accessing, setting up, and managing your emails. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="emails" showIcon={ false } />,
						},
					}
				) }
				align="left"
			/>
		</div>
	);
}
