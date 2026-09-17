export type InstallStrategy = 'in-place' | 'atomic-transfer' | 'none';

/**
 * How the requested product should be installed on the current site:
 * - `in-place`: the site already runs plugins/themes (Jetpack or Atomic), so install directly.
 * - `atomic-transfer`: a Simple WPCOM site that qualifies for Atomic must transfer first.
 * - `none`: the site can't install, so nothing is initiated.
 */
export function chooseInstallStrategy( {
	siteInstallsInPlace,
	siteCanTransferToAtomic,
}: {
	siteInstallsInPlace: boolean;
	siteCanTransferToAtomic: boolean;
} ): InstallStrategy {
	if ( siteInstallsInPlace ) {
		return 'in-place';
	}
	if ( siteCanTransferToAtomic ) {
		return 'atomic-transfer';
	}
	return 'none';
}
