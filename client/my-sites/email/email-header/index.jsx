import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';

import './style.scss';

export default function EmailHeader() {
	const translate = useTranslate();

	return (
		<div className="email-header">
			<NavigationHeader
				className="domains-email__navigation-header"
				navigationItems={ [] }
				title={ translate( 'Emails' ) }
				subtitle={ translate(
					'Your home base for accessing, setting up, and managing your emails. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="emails" showIcon={ false } />,
						},
					}
				) }
			/>
		</div>
	);
}
