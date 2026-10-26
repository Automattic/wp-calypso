import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { withSiteContext } from '@automattic/calypso-analytics';
import { parseAdminBarNodeTitle } from '@automattic/omnibar';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useAnalytics } from '../analytics';
import { useHelpCenter } from '../help-center';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './node-help-center.scss';

function HelpCenterIcon( { name, sectionName }: { name?: string; sectionName?: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );

	// One impression per section view, so it divides cleanly into the click events
	// this node records; site context is whatever has resolved by then.
	useEffect( () => {
		recordTracksEvent(
			'calypso_inlinehelp_impression',
			withSiteContext(
				{
					location: 'help-center',
					entry_point: 'omnibar',
					section: sectionName,
				},
				'omnibar',
				omnibarSiteId
			)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sectionName ] );

	return adminBarIcon( name, 'omnibar__help-icon' );
}

export function useHelpCenterNodeBuilder( { sectionName }: { sectionName?: string } ) {
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();

	const nodeBuilder = useCallback(
		( adminBarNode: AdminBarNode ): Partial< OmnibarNode > => {
			const { text, tooltip } = parseAdminBarNodeTitle( adminBarNode );
			const menuTitle = adminBarNode.meta?.menu_title || undefined;

			return {
				label: menuTitle ?? tooltip ?? text,
				title: menuTitle,
				tooltip: menuTitle ?? tooltip,
				href: undefined,
				icon: (
					<HelpCenterIcon name={ adminBarNode.meta?.icon ?? 'help' } sectionName={ sectionName } />
				),
				onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
			};
		},
		[ sectionName, isHelpCenterShown, setShowHelpCenter ]
	);

	return { nodeBuilder };
}
