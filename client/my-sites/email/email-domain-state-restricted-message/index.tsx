import { CALYPSO_CONTACT } from '@automattic/urls';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import PromoCard from 'calypso/components/promo-section/promo-card';

import './style.scss';

type EmailDomainStateRestrictedMessageProps = {
	domainName: string;
};

export const EmailDomainStateRestrictedMessage = (
	props: EmailDomainStateRestrictedMessageProps
) => {
	const { domainName } = props;

	const translate = useTranslate();

	const translateOptions = {
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } rel="noopener noreferrer" target="_blank" />,
			strong: <strong />,
		},
		args: {
			domainName,
		},
	};

	const reasonText: TranslateResult = translate(
		'You are not currently allowed to buy email services for {{strong}}%(domainName)s{{/strong}}. Please {{contactSupportLink}}contact support{{/contactSupportLink}} for more details.',
		translateOptions
	);

	return (
		<PromoCard className="email-domain-state-restricted-message__promo-card">
			<p>{ reasonText }</p>
		</PromoCard>
	);
};
