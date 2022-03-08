import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { hasGSuiteWithAnotherProvider, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

const EmailExistingPaidServiceNotice = ( {
	domain,
}: {
	domain: ResponseDomain | SiteDomain;
} ): JSX.Element | null => {
	const translate = useTranslate();

	const hasGoogleWithAnotherProvider = hasGSuiteWithAnotherProvider( domain );
	const hasGoogleWithUs = hasGSuiteWithUs( domain );
	const hasProfessionalEmailWithUs = hasTitanMailWithUs( domain );

	const showWarning = hasGoogleWithAnotherProvider || hasGoogleWithUs || hasProfessionalEmailWithUs;

	if ( ! showWarning ) {
		return null;
	}

	let message = null;

	if ( hasGoogleWithAnotherProvider || hasGoogleWithUs ) {
		message = translate(
			'You already have Google email set up for the domain %(domainName)s. Please check if you really want a different email service, as changing email providers may disrupt your existing service.',
			{
				args: {
					domainName: domain.domain,
				},
				comment: "%(domainName)s is a domain name, such as 'example.com' or 'yourgroovydomain.com'",
			}
		);
	} else if ( hasProfessionalEmailWithUs ) {
		message = translate(
			'You already have Professional Email set up for the domain %(domainName)s. Please check if you really want a different email service, as changing email providers may disrupt your existing service.',
			{
				args: {
					domainName: domain.domain,
				},
				comment: "%(domainName)s is a domain name, such as 'example.com' or 'yourgroovydomain.com'",
			}
		);
	}

	if ( null === message ) {
		return null;
	}

	return (
		<Notice showDismiss={ false } status="is-warning">
			{ message }
		</Notice>
	);
};

export default EmailExistingPaidServiceNotice;
