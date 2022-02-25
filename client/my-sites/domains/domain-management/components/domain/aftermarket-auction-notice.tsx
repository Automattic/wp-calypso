import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { DOMAIN_EXPIRATION_AUCTION } from 'calypso/lib/url/support';

const AftermarketAutcionNotice = ( { domainName }: { domainName: string } ): JSX.Element => {
	const translate = useTranslate();
	const text = translate(
		'{{strong}}%(domain)s{{/strong}} has been placed at auction. Currently it is not possible to renew it. {{a}}Learn more{{/a}}',

		{
			components: {
				a: <a href={ DOMAIN_EXPIRATION_AUCTION } target="_blank" rel="noopener noreferrer" />,
				strong: <strong />,
			},
			args: {
				domain: domainName,
			},
		}
	);

	return <Notice text={ text } status="is-warning" showDismiss={ false } />;
};

export default AftermarketAutcionNotice;
