import { withMobileBreakpoint } from '@automattic/viewport-react';
import cookie from 'cookie';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { ProvideExperimentData } from 'calypso/lib/explat';
import { userCan } from 'calypso/lib/site/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import {
	getSiteSlug,
	getSite,
	getSitePlanSlug,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import MasterbarItem from './item';

const THREE_WEEKS = 3 * 7 * 24 * 60 * 60;
class MasterbarItemPlanUpsell extends Component {
	static propTypes = {
		className: PropTypes.string,
		tooltip: TranslatableString,
	};

	planUpsellButtonRef = createRef();

	clickPlanUpsell = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_click', {
			clicked: 'plan_upsell_button',
		} );
		document.cookie = cookie.serialize(
			'masterbar_plan_upsell_' + this.props.siteId,
			'button_clicked',
			{
				path: '/',
				domain: '.wordpress.com',
			}
		);
	};

	checkIsRestrictedRoute = ( siteSlug, currentRoute ) => {
		const restrictedRoutes = [
			`/plans/${ siteSlug }`,
			'/plans/monthly',
			'/plans/yearly',
			'/checkout',
		];
		return -1 !== restrictedRoutes.findIndex( ( route ) => currentRoute.startsWith( route ) );
	};

	checkIsPurchased = ( siteSlug, currentRoute ) => {
		const thankYouPages = [ '/checkout/thank-you', `/checkout/${ siteSlug }/offer-plan-upgrade` ];
		return -1 !== thankYouPages.findIndex( ( route ) => currentRoute.startsWith( route ) );
	};

	checkIsSupportedPlan = ( planSlug ) => {
		const plansUpsells = [
			'free_plan',
			'personal-bundle-monthly',
			'value_bundle_monthly',
			'business-bundle-monthly',
			'ecommerce-bundle-monthly',

			'personal-bundle',
			'value_bundle',
			'business-bundle',
		];

		return plansUpsells.includes( planSlug );
	};

	render() {
		const {
			plansPath,
			currentRoute,
			isP2,
			className,
			isJetpackNotAtomic,
			tooltip,
			isMobile,
			planSlug,
			siteId,
			siteSlug,
		} = this.props;

		const cookies = cookie.parse( document.cookie );
		const isPurchased = this.checkIsPurchased( siteSlug, currentRoute );
		const isRestrictedRoute = this.checkIsRestrictedRoute( siteSlug, currentRoute );

		const cookieKey = 'masterbar_plan_upsell_' + siteId;
		if ( isPurchased && 'button_clicked' === cookies[ cookieKey ] ) {
			document.cookie = cookie.serialize( cookieKey, 'purchased', {
				path: '/',
				domain: '.wordpress.com',
				maxAge: THREE_WEEKS,
			} );
		}

		const isFlowCompleted = 'purchased' === cookies[ cookieKey ];
		const isSupportedPlan = this.checkIsSupportedPlan( planSlug );

		const showPlanUpsell =
			! isRestrictedRoute &&
			! isMobile &&
			! isFlowCompleted &&
			! isP2 &&
			! isJetpackNotAtomic &&
			isSupportedPlan;

		if ( ! showPlanUpsell ) {
			return null;
		}

		return (
			<ProvideExperimentData
				name="masterbar_plan_upsell_202202_v1"
				options={ {
					isEligible: showPlanUpsell,
				} }
			>
				{ ( isLoading, experimentAssignment ) => {
					if ( isLoading ) {
						return null;
					}

					const variation = experimentAssignment?.variationName;
					return (
						'treatment' === variation && (
							<MasterbarItem
								ref={ this.planUpsellButtonRef }
								url={ plansPath }
								onClick={ this.clickPlanUpsell }
								className={ className }
								tooltip={ tooltip }
							>
								{ this.props.children }
							</MasterbarItem>
						)
					);
				} }
			</ProvideExperimentData>
		);
	}
}

export default withMobileBreakpoint(
	connect(
		( state, ownProps ) => {
			let siteId = getSelectedSiteId( state );
			const site = getSite( state, siteId );

			if ( ! userCan( 'manage_options', site ) ) {
				siteId = getPrimarySiteId( state );
			}

			const planSlug = getSitePlanSlug( state, siteId ) || '';
			const siteSlug = getSiteSlug( state, siteId );
			const currentRoute = getCurrentRoute( state );

			let plansPath = '/plans/';
			if ( 'ecommerce-bundle-monthly' === planSlug ) {
				plansPath += 'yearly/';
			}
			plansPath += siteSlug;

			return {
				isP2: isSiteWPForTeams( state, siteId ),
				isJetpackNotAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
				planSlug,
				siteSlug,
				isMobile: ownProps.isBreakpointActive,
				plansPath,
				currentRoute,
				siteId,
			};
		},
		{ recordTracksEvent }
	)( MasterbarItemPlanUpsell )
);
