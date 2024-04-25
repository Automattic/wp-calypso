import { localizeUrl } from '@automattic/i18n-utils';
import { DOMAIN_EXPIRATION_AUCTION } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

const AftermarketAutcionNotice = ( { domainName }: { domainName: string } ) => {
	const translate = useTranslate();
	const text = translate(
		'{{strong}}%(domain)s{{/strong}} expired over 30 days ago and has been offered for sale at auction. Currently it is not possible to renew it. {{a}}Learn more{{/a}}',

		{
			components: {
				a: (
					<a
						href={ localizeUrl( DOMAIN_EXPIRATION_AUCTION ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
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
