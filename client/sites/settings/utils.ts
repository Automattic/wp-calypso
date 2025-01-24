import { isEnabled } from '@automattic/calypso-config';

export function isHostingMenuUntangled() {
	const isDuplicateViewsExperiment = true;
	return (
		( isEnabled( 'untangling/hosting-menu' ) || isDuplicateViewsExperiment ) &&
		window?.location?.pathname?.startsWith( '/sites/settings' )
	);
}
