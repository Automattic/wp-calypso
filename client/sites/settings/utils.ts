import { isEnabled } from '@automattic/calypso-config';

export function isHostingMenuUntangled() {
	return (
		isEnabled( 'untangling/hosting-menu' ) &&
		window?.location?.pathname?.startsWith( '/sites/settings' )
	);
}
