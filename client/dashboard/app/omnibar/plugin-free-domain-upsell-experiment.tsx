import { Icon } from '@wordpress/components';
import { upsell } from '../../components/icons';
import type { AnalyticsClient } from '../analytics';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-free-domain-upsell-experiment.scss';

export function createFreeDomainUpsellNodeBuilder( {
	source,
	recordTracksEvent,
}: {
	source: string;
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ];
} ) {
	return ( adminBarNode: AdminBarNode ): Partial< OmnibarNode > => {
		const eventProps = {
			upsell_id: 'omnibar-free-domain',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			upsell_source: ( adminBarNode.meta as any )?.upsell_source as string | undefined,
			source,
		};

		return {
			icon: <Icon icon={ upsell } size={ 16 } />,
			className: 'omnibar__free-domain-upsell',
			onView: () => recordTracksEvent( 'calypso_omnibar_upsell_impression', eventProps ),
			onClick: () => recordTracksEvent( 'calypso_omnibar_upsell_click', eventProps ),
		};
	};
}
