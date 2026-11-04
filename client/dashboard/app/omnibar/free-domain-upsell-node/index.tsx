import { Icon } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { upsell } from '../../../components/icons';
import { redirectToDashboardLink } from '../../../utils/link';
import type { AnalyticsClient } from '../../analytics';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './style.scss';

export function createFreeDomainUpsellNodeBuilder( {
	sectionName,
	recordTracksEvent,
}: {
	sectionName?: string;
	recordTracksEvent: AnalyticsClient[ 'recordTracksEvent' ];
} ) {
	const source = sectionName === 'dashboard' ? 'dashboard' : 'calypso';

	return ( adminBarNode: AdminBarNode ): Partial< OmnibarNode > => {
		const eventProps = {
			upsell_id: 'omnibar-free-domain',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			upsell_source: ( adminBarNode.meta as any )?.upsell_source as string | undefined,
			source,
		};

		return {
			icon: <Icon icon={ upsell } size={ 16 } viewBox="4 5 16 14" />,
			className: 'omnibar__free-domain-upsell',
			onView: () => recordTracksEvent( 'calypso_omnibar_upsell_impression', eventProps ),
			onClick: ( event ) => {
				recordTracksEvent( 'calypso_omnibar_upsell_click', eventProps );

				// The flow's Back button follows `back_to`. The omnibar is its own React
				// root and does not re-render on Dashboard route changes, so the link is
				// pointed at the current page here rather than when the node is built.
				if ( source === 'dashboard' && event.currentTarget instanceof HTMLAnchorElement ) {
					event.currentTarget.href = addQueryArgs( event.currentTarget.href, {
						back_to: redirectToDashboardLink( { supportBackport: true } ),
					} );
				}
			},
		};
	};
}
