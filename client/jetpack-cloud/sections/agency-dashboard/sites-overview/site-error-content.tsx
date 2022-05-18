import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { ReactElement } from 'react';

export default function SiteErrorContent( { siteUrl }: { siteUrl: string } ): ReactElement {
	const translate = useTranslate();

	const handleClickFixNow = () => {
		// Handle track event here
	};

	return (
		<div className="sites-overview__error-container">
			<span className="sites-overview__error-icon">
				<Gridicon size={ 18 } icon="notice-outline" />
			</span>
			<span className="sites-overview__error-message sites-overview__error-message-large-screen">
				{ translate( 'Jetpack is unable to connect to %(siteUrl)s', {
					args: {
						siteUrl,
					},
				} ) }
			</span>
			<span className="sites-overview__error-message sites-overview__error-message-small-screen">
				{ translate( 'Jetpack is unable to connect' ) }
			</span>
			<a
				onClick={ handleClickFixNow }
				className="sites-overview__error-message-link"
				href={ `/settings/disconnect-site/${ siteUrl }?type=down` }
			>
				{ translate( 'Fix now' ) }
			</a>
		</div>
	);
}
