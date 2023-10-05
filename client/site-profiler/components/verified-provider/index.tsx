import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import useHostingProviderURL from 'calypso/site-profiler/hooks/use-hosting-provider-url';
import './styles.scss';

interface Props {
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	showHostingProvider: boolean;
}

export default function VerifiedProvider( props: Props ) {
	const { hostingProvider, urlData, showHostingProvider } = props;
	const hostingProviderName = useHostingProviderName( hostingProvider, urlData );
	const hostingProviderHomepage = useHostingProviderURL( 'homepage', hostingProvider, urlData );
	const hostingProviderLogin = useHostingProviderURL( 'login', hostingProvider, urlData );

	return (
		<div className="verified-provider">
			<span className="status-icon status-icon--small blue">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="checkmark" size={ 10 } />
			</span>
			<a href={ showHostingProvider ? hostingProviderHomepage : 'https://wordpress.com' }>
				{ showHostingProvider ? hostingProviderName : translate( 'WordPress.com' ) }
			</a>
			&nbsp;(
			<a href={ showHostingProvider ? hostingProviderLogin : 'https://wordpress.com/login' }>
				{ translate( 'login' ) }
			</a>
			)
		</div>
	);
}
