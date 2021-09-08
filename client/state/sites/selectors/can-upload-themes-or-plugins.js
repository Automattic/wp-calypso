import isSiteOnAtomicPlan from 'calypso/state/selectors/is-site-on-atomic-plan';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';

// Only Atomic sites with plans Business and above can install third-party themes and/or plugins.
export default function siteCanUploadThemesOrPlugins( state, siteId ) {
	return isSiteOnAtomicPlan( state, siteId ) && isSiteWpcomAtomic( state, siteId );
}
