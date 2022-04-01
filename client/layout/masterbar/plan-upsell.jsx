import { withMobileBreakpoint } from '@automattic/viewport-react';
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
		} = this.props;

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

		const restrictedRoutes = [ '/plans', '/checkout' ];
		const isRestrictedRoute =
			-1 !== restrictedRoutes.findIndex( ( route ) => currentRoute.startsWith( route ) );

		const showPlanUpsell =
			! isRestrictedRoute &&
			! isMobile &&
			! isP2 &&
			! isJetpackNotAtomic &&
			plansUpsells.includes( planSlug );

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

			let plansPath = '/plans/';
			if ( 'ecommerce-bundle-monthly' === planSlug ) {
				plansPath += 'yearly/';
			}
			plansPath += getSiteSlug( state, siteId );

			return {
				isP2: isSiteWPForTeams( state, siteId ),
				isJetpackNotAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
				planSlug,
				isMobile: ownProps.isBreakpointActive,
				plansPath,
				currentRoute: getCurrentRoute( state ),
			};
		},
		{ recordTracksEvent }
	)( MasterbarItemPlanUpsell )
);
