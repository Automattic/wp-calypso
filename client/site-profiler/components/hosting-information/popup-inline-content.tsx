import { translate } from 'i18n-calypso';
import type { HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	hostingProvider?: HostingProvider;
}

export default function HostingPopupContent( props: Props ) {
	const { hostingProvider } = props;
	const hostingProviderName = hostingProvider?.name || '';

	return (
		<>
			<p>
				{ translate(
					'There is a chance that this website masks its IP address using %(hostingProviderName)s, a popular CDN. That means we can’t know the exact host.',
					{
						args: { hostingProviderName },
					}
				) }
			</p>
			<p>
				{ translate(
					'If you need to find the host for DMCA, {{a}}contact %(hostingProviderName)s{{/a}}, who will provide you with the contact information.',
					{
						args: { hostingProviderName },
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
		</>
	);
}
