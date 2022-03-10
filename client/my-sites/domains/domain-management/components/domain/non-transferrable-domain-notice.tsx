import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

const NonTransferrableDomainNotice = ( { domainName }: { domainName: string } ): JSX.Element => {
	const translate = useTranslate();
	const text = translate(
		"{{strong}}%(domain)s{{/strong}} is already past its redemption period so it's not possible to transfer it.",
		{
			components: { strong: <strong /> },
			args: { domain: domainName },
		}
	);

	return <Notice text={ text } status="is-warning" showDismiss={ false } />;
};

export default NonTransferrableDomainNotice;
