import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { withSiteContext } from '@automattic/calypso-analytics';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../analytics';
import { useHelpCenter } from '../help-center';
import { adminBarIcon } from './admin-bar-icon';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-help-center.scss';

const HELP_CENTER_NODE_ID = 'help-center';

function HelpCenterIcon( { name, sectionName }: { name?: string; sectionName?: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );

	// One impression per section view, so it divides cleanly into the click events
	// this plugin records; site context is whatever has resolved by then.
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

export function useHelpCenterPlugin( {
	sectionName,
	adminBarNodes,
}: {
	sectionName?: string;
	adminBarNodes: AdminBarNode[];
} ): OmnibarNode {
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();

	// Older backends send no node; the client-side defaults cover them.
	// `menu_title` arrives only when the entry point shows a label.
	const helpCenterNode = adminBarNodes.find( ( node ) => node.id === HELP_CENTER_NODE_ID );
	const menuTitle = helpCenterNode?.meta?.menu_title || undefined;

	return {
		id: HELP_CENTER_NODE_ID,
		label: __( 'Help' ),
		title: menuTitle,
		tooltip: menuTitle,
		icon: (
			<HelpCenterIcon name={ helpCenterNode?.meta?.icon ?? 'help' } sectionName={ sectionName } />
		),
		onClick: () => setShowHelpCenter( ! isHelpCenterShown ),
	};
}
