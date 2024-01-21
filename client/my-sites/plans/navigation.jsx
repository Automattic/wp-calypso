import { PLAN_100_YEARS } from '@automattic/calypso-products';
import { isMobile } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { sectionify } from 'calypso/lib/route';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class PlansNavigation extends Component {
	static propTypes = {
		isJetpack: PropTypes.bool,
		path: PropTypes.string.isRequired,
		shouldShowNavigation: PropTypes.bool,
		site: PropTypes.object,
		isTrial: PropTypes.bool,
	};

	static planPaths = [
		'/plans',
		'/plans/monthly',
		'/plans/yearly',
		'/plans/2yearly',
		'/plans/3yearly',
	];

	getSectionTitle( path ) {
		const { translate } = this.props;

		if ( path === '/plans/my-plan' ) {
			return translate( 'My Plan' );
		}

		if ( PlansNavigation.planPaths.includes( path ) ) {
			return translate( 'Plans' );
		}

		return path.split( '?' )[ 0 ].replace( /\//g, ' ' );
	}

	isSiteOn100YearPlan() {
		const { site } = this.props;
		return site?.plan?.product_slug === PLAN_100_YEARS;
	}

	render() {
		const { site, shouldShowNavigation, translate, isTrial } = this.props;
		const path = sectionify( this.props.path );
		const sectionTitle = this.getSectionTitle( path );
		const hasPinnedItems = Boolean( site ) && isMobile();
		const myPlanItemTitle = isTrial ? translate( 'Free trial' ) : translate( 'My Plan' );

		if ( ! site || ! shouldShowNavigation ) {
			return;
		}

		return (
			<div className="navigation">
				<SectionNav hasPinnedItems={ hasPinnedItems } selectedText={ sectionTitle }>
					<NavTabs label={ translate( 'Section' ) } selectedText={ sectionTitle }>
						<NavItem
							path={ `/plans/my-plan/${ site.slug }` }
							selected={ path === '/plans/my-plan' }
						>
							{ myPlanItemTitle }
						</NavItem>
						{ ! this.isSiteOn100YearPlan() && (
							<NavItem
								path={ `/plans/${ site.slug }` }
								selected={ PlansNavigation.planPaths.includes( path ) }
							>
								{ translate( 'Plans' ) }
							</NavItem>
						) }
					</NavTabs>
				</SectionNav>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const site = getSite( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isOnFreePlan = isSiteOnFreePlan( state, siteId );
	const isAtomic = isAtomicSite( state, siteId );

	return {
		isJetpack,
		shouldShowNavigation: ! isOnFreePlan || ( isJetpack && ! isAtomic ),
		site,
		isTrial: isTrialSite( state, siteId ),
	};
} )( localize( PlansNavigation ) );
