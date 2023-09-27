import { Popover, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React, { useRef, useState } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import VerifiedProvider from '../domain-information/verified-provider';
import type { HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
}

export default function HostingProviderName( props: Props ) {
	const { hostingProvider, urlData } = props;
	const isPopularCdn = !! hostingProvider?.is_cdn;
	const [ popoverVisible, setPopoverVisible ] = useState( false );
	const hostingProviderNameRef: React.RefObject< HTMLDivElement > = useRef( null );
	const getNonAutomatticHostingElement = () => {
		const nameComponent = isPopularCdn ? (
			<Button
				borderless={ true }
				className="action-buttons__borderless hosting-provider-name"
				href="#"
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
			</>
		);
	};

	return (
		<div
			ref={ hostingProviderNameRef }
			onFocus={ () => isPopularCdn && setPopoverVisible( true ) }
			onBlur={ () => setPopoverVisible( false ) }
			onMouseEnter={ () => isPopularCdn && setPopoverVisible( true ) }
			onMouseLeave={ () => setPopoverVisible( false ) }
		>
			{ hostingProvider?.slug !== 'automattic' && getNonAutomatticHostingElement() }
			{ hostingProvider?.slug === 'automattic' && <VerifiedProvider /> }
			{ isPopularCdn && (
				<Popover
					className="info-popover__tooltip info-popover__tooltip--hosting-provider"
					focusOnShow={ false }
					context={ hostingProviderNameRef.current }
					isVisible={ popoverVisible }
				>
					<p>
						{ translate(
							'There is a chance that this website masks its IP address using %(hostingProviderName)s, a popular CDN. That means we can’t know the exact host.',
							{
								args: { hostingProviderName: hostingProvider?.name },
							}
						) }
					</p>
					<p>
						{ translate(
							'If you need to find the host for DMCA, {{a}}contact %(hostingProviderName)s{{/a}}, who will provide you with the contact information.',
							{
								args: { hostingProviderName: hostingProvider?.name },
								components: {
									a: hostingProvider?.support_url ? (
										<a
											href={ hostingProvider?.support_url }
											target="_blank"
											rel="noopener noreferrer"
										/>
									) : (
										<span />
									),
								},
							}
						) }
					</p>
				</Popover>
			) }
		</div>
	);
}
