import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-site-badges.scss';

export function buildSiteBadgeNode( adminBarNode: AdminBarNode ): Partial< OmnibarNode > {
	const doc = new DOMParser().parseFromString( adminBarNode.title || '', 'text/html' );
	const info = doc.querySelector( '.wp-admin-bar__site-info' );
	const label = info?.querySelector( '.wp-admin-bar__site-info-label' )?.textContent?.trim();
	const value = info?.querySelector( '.wp-admin-bar__info-badges' )?.textContent?.trim();

	if ( ! value ) {
		return {};
	}

	const href = info?.getAttribute( 'href' ) ?? undefined;

	return {
		title: undefined,
		href,
		disabled: ! href,
		render: () => (
			<span className="omnibar__site-badge">
				<span className="omnibar__site-badge-label">{ label }</span>
				<span className="omnibar__site-badge-value">{ value }</span>
			</span>
		),
	};
}
