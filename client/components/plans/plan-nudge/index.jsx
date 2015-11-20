/**
* External dependencies
*/
import React from 'react';
import defer from 'lodash/function/defer';
import page from 'page';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import CompactCard from 'components/card/compact';
import PlanPreview from './preview';
import plansList from 'lib/plans-list';
import * as upgradesActions from 'lib/upgrades/actions';
import Gridicon from 'components/gridicon';
import { handlePlanSelect } from 'my-sites/plans/controller';

/**
 * Module variables
 */
const plans = plansList();

export default React.createClass( {
	displayName: 'PlanNudge',

	propTypes: {
		currentProductId: React.PropTypes.number.isRequired,
		selectedSiteSlug: React.PropTypes.string.isRequired,
	},

	componentDidMount: function() {
		plans.on( 'change', this.updatePlans );

		this.updatePlans();
	},

	componentWillUnmount: function() {
		plans.off( 'change', this.updatePlans );
	},

	updatePlans: function() {
		this.setState( {
			currentPlan: plans.get().find( plan => plan.product_id === this.props.currentProductId ),
			businessPlan: plans.getPlanFromPath( 'business' )
		} );
	},

	handleNewPlan: function() {
		handlePlanSelect( this.state.businessPlan, this.props.selectedSiteSlug );
	},

	render: function() {
		if ( ! this.state || ! this.state.currentPlan || ! this.state.businessPlan ) {
			return null;
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'WordPress.com Plugins' ) } />
				<CompactCard className='plan-nudge__selection'>
					<h3 className="plan-nudge__title">
						{ this.translate( 'Want to add a store to your site?' ) }
					</h3>
					<div>
						{ this.translate( 'Upgrade to WordPress.com Business to connect your Shopify, Ecwid, or Gumroad store to your site.' ) }
					</div>
					<div className="plan-nudge__plan-container">
						<div className='plan-nudge__plan current-plan'>
							<span className="plan__status">{ this.translate( 'Current Plan' ) }</span>
							<PlanPreview plan={ this.state.currentPlan } />
						</div>
						<div className='plan-nudge__plan new-plan'>
							<span className="plan__status">{ this.translate( 'New Plan' ) }</span>
							<PlanPreview plan={ this.state.businessPlan } action={ this.handleNewPlan } actionLabel={ this.translate('Add eCommerce & more' ) } />
						</div>
					</div>
				</CompactCard>
				<CompactCard className='plan-nudge__footer'>
					<Gridicon icon="info-outline" ></Gridicon>
					<h4 className="footer__title">
						{ this.translate( "Why can't I add plugins to my site? " ) }
					</h4>
					<div>
						{ this.translate( 'WordPress.com has many powerful plugins already built in and free to use. Additional ecommerce plugins (Shopify, Ecwid, Gumroad) are available with WordPress.com Business.') }
						<a href="http://support.wordpress.com/plugins/" target="_blank">
							{ this.translate( 'Learn more about plugins.') }
						</a>
					</div>
				</CompactCard>
			</div>
		);
	}
} );
