import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import InfoPopover from 'calypso/components/info-popover';
import VerifiedProvider from '../domain-information/verified-provider';
import HostingPopupContent from './popup-inline-content';
import type { HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
}

export default function HostingProviderName( props: Props ) {
	const { hostingProvider, urlData } = props;
	const isPopularCdn = !! hostingProvider?.is_cdn;
	const getNonAutomatticHostingElement = () => {
		const nameComponent = hostingProvider?.home_url ? (
			<Button
				borderless={ true }
				className="action-buttons__borderless hosting-provider-name__link"
				href={ hostingProvider?.home_url }
			>
				{ hostingProvider?.name }
			</Button>
		) : (
			hostingProvider?.name
		);
		return (
			<>
				{ nameComponent }
				{ urlData?.platform === 'wordpress' && (
					<>
						&nbsp;&nbsp;
						<a href={ `${ urlData.url }wp-admin` } target="_blank" rel="nofollow noreferrer">
							({ translate( 'login' ) })
						</a>
					</>
				) }
				{ isPopularCdn && (
					<InfoPopover className="hosting-provider-name__tooltip">
						<HostingPopupContent hostingProvider={ hostingProvider } />
					</InfoPopover>
				) }
			</>
		);
	};

	return (
		<div className="hosting-provider-name__container">
			{ hostingProvider?.slug !== 'automattic' && getNonAutomatticHostingElement() }
			{ hostingProvider?.slug === 'automattic' && <VerifiedProvider /> }
		</div>
	);
}
