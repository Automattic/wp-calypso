import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';

interface Props {
	conversionAction?: CONVERSION_ACTION;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
}
export default function StatusInfo( props: Props ) {
	const { conversionAction, hostingProvider, urlData } = props;
	const hostingProviderName = useHostingProviderName( hostingProvider, urlData );

	switch ( conversionAction ) {
		case 'register-domain':
			return (
				<p>
					{ translate( 'What a great domain! This site is available and could be yours today!' ) }
				</p>
			);
		case 'transfer-domain':
		case 'transfer-google-domain':
			return (
				<p>
					{ translate(
						'This site is hosted on {{strong}}%s{{/strong}} but the domain is registered elsewhere.',
						{
							components: { strong: <strong /> },
							args: [ hostingProviderName ],
						}
					) }
				</p>
			);
		case 'transfer-hosting':
			return (
				<p>
					{ translate(
						'This site is using {{strong}}WordPress.com{{/strong}} to manage the domain, but it’s hosted elsewhere',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);

		case 'transfer-domain-hosting':
		case 'transfer-google-domain-hosting':
			return (
				<p>
					{ translate(
						'The hosting and domain of this site are not on {{strong}}WordPress.com{{/strong}}, but they could be!',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		case 'transfer-hosting-wp':
		case 'transfer-domain-hosting-wp':
		case 'transfer-google-domain-hosting-wp':
			return (
				<p>
					{ translate( 'The owner of this site has great taste—this site runs on WordPress!' ) }
				</p>
			);
		case 'idle':
			return (
				<p>
					{ translate(
						'Looks like the owner of this site has great taste. The site and domain are both hosted on {{strong}}WordPress.com{{/strong}}!',
						{
							components: { strong: <strong /> },
						}
					) }
				</p>
			);
		default:
			return null;
	}
}
