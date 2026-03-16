import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import OverviewCard from '../../components/overview-card';
import type { OverviewCardProps } from '../../components/overview-card';

export default function JetpackConnectionWarningCard( {
	icon,
	title,
	tracksId,
}: Pick< OverviewCardProps, 'icon' | 'title' | 'tracksId' > ) {
	return (
		<OverviewCard
			icon={ icon }
			title={ title }
			tracksId={ tracksId }
			heading={ __( 'Connection issue' ) }
			description={ __( 'Jetpack is unable to reach your site.' ) }
			externalLink={ localizeUrl(
				'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
			) }
			intent="warning"
		/>
	);
}
