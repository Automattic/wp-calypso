import { isMobile } from '@automattic/viewport';
import { translate } from 'i18n-calypso';
import { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';
import useHostingProviderName from '../../hooks/use-hosting-provider-name';
import { Skeleton } from '../skeleton-screen';
import type { SPECIAL_DOMAIN_CATEGORY } from '../../utils/get-domain-category';
import type { UrlData } from 'calypso/blocks/import/types';
import type { HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	conversionAction?: CONVERSION_ACTION;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	domainCategory?: SPECIAL_DOMAIN_CATEGORY;
}
export default function StatusInfo( props: Props ) {
	const { conversionAction, hostingProvider, urlData, domainCategory } = props;
	const hostingProviderName = useHostingProviderName( hostingProvider, urlData );

	// if there's a domain category, use that instead of the conversion action
	const finalStatus = domainCategory ?? conversionAction;

	switch ( finalStatus ) {
		case 'wordpress-com':
			return <p>{ translate( 'Well yes, WordPress.com runs on WordPress.com!' ) }</p>;
		case 'wordpress-org':
			return (
				<p>
					{ translate(
						'This amazing community have great taste–this site runs on self-hosted WordPress!'
					) }
				</p>
			);
		case 'automattic-com':
			return <p>{ translate( 'It’s WordPress.com all the way down!' ) }</p>;
		case 'local-development':
			return (
				<p>
					{ translate(
						'Home is where localhost is, right? Just so you know, we have no idea where that is.'
					) }
				</p>
			);
		case 'wpcom-sp':
			return (
				<p>
					{ translate(
						'Profiling the profiler? Nice try! Believe it or not, it’s hosted on WordPress.com.'
					) }
				</p>
			);
		case 'tumblr-com':
			return (
				<p>{ translate( 'A WordPress.com? On my Tumblr? What? PS: It may contain crabs.' ) }</p>
			);
		case 'gravatar-com':
		case 'akismet-com':
		case 'genaral-a8c-properties':
			return <p>{ translate( 'This site is proudly hosted on WordPress.com.' ) }</p>;
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
					{ translate(
						'The owner of this site has great taste—this site runs on self-hosted WordPress!'
					) }
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
			return <Skeleton width={ isMobile() ? '100%' : '50%' } height={ 24 } />;
	}
}
