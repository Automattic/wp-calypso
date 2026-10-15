import { logout } from '../auth';
import type { User } from '@automattic/api-core';
import type { OmnibarNode } from '@automattic/omnibar';

export function createLogoutNodeBuilder( user: User ) {
	return (): Partial< OmnibarNode > => ( {
		href: undefined,
		onClick: () => {
			logout( user );
		},
	} );
}
