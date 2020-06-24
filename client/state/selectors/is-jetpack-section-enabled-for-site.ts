/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import { isEnabled } from 'config';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isJetpackSite from 'state/sites/selectors/is-jetpack-site';

const FLAG_JETPACK_SITES = 'jetpack/features-section/jetpack';
const FLAG_ATOMIC_SITES = 'jetpack/features-section/atomic';
const FLAG_SIMPLE_SITES = 'jetpack/features-section/simple';

export default function isJetpackSectionEnabledForSite( state: object, siteId?: number | null ) {
	// If the ab test is disabled there's no need to look any further.
	if ( abtest( 'jetpackSidebarSection' ) !== 'showJetpackSidebarSection' ) {
		return false;
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
