import { OmnibarHomeIcon } from './home';
import type { AdminBarNode, OmnibarNode } from '@automattic/omnibar';

import './plugin-wpcom-account.scss';

export function buildWpcomAccountNode( adminBarNode: AdminBarNode ): Partial< OmnibarNode > {
	const doc = new DOMParser().parseFromString( adminBarNode.title || '', 'text/html' );
	const button = doc.querySelector( '.wpcom-button' ) ?? doc.body;
	const content = Array.from( button.childNodes ).map( ( child, index ) =>
		( child as Element ).classList?.contains( 'wpcom-logo' ) ? (
			<OmnibarHomeIcon key={ index } />
		) : (
			child.textContent
		)
	);

	return {
		title: undefined,
		render: () => <span className="omnibar__wpcom-account">{ content }</span>,
	};
}
