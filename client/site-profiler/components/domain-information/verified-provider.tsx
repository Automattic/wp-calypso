import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import useHostingProviderURL from 'calypso/site-profiler/hooks/use-hosting-provider-url';

interface Props {
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
}

export default function VerifiedProvider( props: Props ) {
	const { hostingProvider, urlData } = props;
	const hostingProviderName = useHostingProviderName( hostingProvider, urlData );
	const hostingProviderHomepage = useHostingProviderURL( 'homepage', hostingProvider, urlData );
	const hostingProviderLogin = useHostingProviderURL( 'login', hostingProvider, urlData );

	return (
		<>
			<span className="status-icon status-icon--small blue">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="checkmark" size={ 10 } />
			</span>
			<a href={ hostingProviderHomepage }>{ hostingProviderName }</a>
			&nbsp;&nbsp;
			<a href={ hostingProviderLogin }>({ translate( 'login' ) })</a>
		</>
	);
}
