import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import TranslatableString from 'calypso/components/translatable/proptype';
import { ProvideExperimentData } from 'calypso/lib/explat';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
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
		const { siteSlug, isP2, className, isJetpack, tooltip, planSlug } = this.props;

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
		const showPlanUpsell = ! isP2 && ! isJetpack && plansUpsells.includes( planSlug );
		const plansUpsellPath = '/plans/' + siteSlug;

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
								url={ plansUpsellPath }
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

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const siteId = selectedSiteId || getPrimarySiteId( state );
		const currentPlan = getCurrentPlan( state, siteId );
		const planSlug = currentPlan?.productSlug || '';

		return {
			siteSlug: getSiteSlug( state, siteId ),
			isP2: isSiteWPForTeams( state, siteId ),
			isJetpack: isJetpackSite( state, siteId ),
			planSlug,
		};
	},
	{ recordTracksEvent }
)( MasterbarItemPlanUpsell );
