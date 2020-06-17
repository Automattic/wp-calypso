/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isJetpackSite from 'state/sites/selectors/is-jetpack-site';

const FLAG_ALL_SITES = 'jetpack/features-section';
const FLAG_JETPACK_SITES = 'jetpack/features-section/jetpack';
const FLAG_ATOMIC_SITES = 'jetpack/features-section/atomic';
const FLAG_SIMPLE_SITES = 'jetpack/features-section/simple';

export default function isJetpackSectionEnabledForSite( state: object, siteId?: number | null ) {
	// If the section is available for all sites,
	// there's no need to look any further.
	if ( isEnabled( FLAG_ALL_SITES ) ) {
		return true;
	}

	// From here, we can only determine whether the Jetpack section is enabled
	// if we have a site ID -- no site ID, no access.
	if ( ! siteId ) {
		return false;
	}

	// An enabled flag here will *only* show the section as enabled
	// for Atomic sites.
	if ( isAtomicSite( state, siteId ) ) {
		return isEnabled( FLAG_ATOMIC_SITES );
	}

	// At this point, we know we're *not* dealing with an Atomic site,
	// so an enabled flag here will only return true for non-Atomic Jetpack sites.
	if ( isJetpackSite( state, siteId ) ) {
		return isEnabled( FLAG_JETPACK_SITES );
	}

	// We assume here that we're dealing only with Simple sites,
	// since we've already handled all (Atomic and non-Atomic) Jetpack sites.
	return isEnabled( FLAG_SIMPLE_SITES );
}
