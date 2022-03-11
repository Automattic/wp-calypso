import { isFreePlanProduct, isFlexiblePlanProduct } from '@automattic/calypso-products';
import { isMobile } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { sectionify } from 'calypso/lib/route';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class PlansNavigation extends Component {
	static propTypes = {
		isJetpack: PropTypes.bool,
		path: PropTypes.string.isRequired,
		shouldShowMyPlan: PropTypes.bool,
		site: PropTypes.object,
	};

	getSectionTitle( path ) {
		switch ( path ) {
			case '/plans/my-plan':
				return 'My Plan';

			case '/plans':
			case '/plans/monthly':
			case '/plans/yearly':
				return 'Plans';

			default:
				return path.split( '?' )[ 0 ].replace( /\//g, ' ' );
		}
	}

	render() {
		const { site, shouldShowMyPlan, shouldShowPlans, translate, eligibleForProPlan } = this.props;
		const path = sectionify( this.props.path );
		const sectionTitle = this.getSectionTitle( path );
		const hasPinnedItems = isMobile() && site;

		return (
			site && (
				<SectionNav hasPinnedItems={ hasPinnedItems } selectedText={ sectionTitle }>
					<NavTabs label="Section" selectedText={ sectionTitle }>
						{ shouldShowMyPlan && (
							<NavItem
								path={ `/plans/my-plan/${ site.slug }` }
								selected={ path === '/plans/my-plan' }
							>
								{ translate( 'My Plan' ) }
							</NavItem>
						) }
						{ shouldShowPlans && (
							<NavItem
								path={ `/plans/${ site.slug }` }
								selected={
									path === '/plans' || path === '/plans/monthly' || path === '/plans/yearly'
								}
							>
								{ eligibleForProPlan ? translate( 'New Plans' ) : translate( 'Plans' ) }
							</NavItem>
						) }
					</NavTabs>
				</SectionNav>
			)
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSite( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isOnFreePlan = isSiteOnFreePlan( state, siteId );
	const isAtomic = isAtomicSite( state, siteId );
	const eligibleForProPlan = isEligibleForProPlan( state, siteId );
	const currentPlan = getCurrentPlan( state, siteId );
	let shouldShowMyPlan = ! isOnFreePlan || ( isJetpack && ! isAtomic );
	let shouldShowPlans = true;

	if ( eligibleForProPlan && currentPlan ) {
		const isFreeOrFlexible =
			isFreePlanProduct( currentPlan ) || isFlexiblePlanProduct( currentPlan );
		shouldShowMyPlan = isFreeOrFlexible ? false : true;
		shouldShowPlans = isFreeOrFlexible ? true : false;
	}
	return {
		isJetpack,
		shouldShowMyPlan,
		shouldShowPlans,
		site,
		eligibleForProPlan,
	};
} )( localize( PlansNavigation ) );
