/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { cancelSitePlanTrial } from 'state/sites/plans/actions';
import CompactCard from 'components/card/compact';
import { connect } from 'react-redux';
import Dialog from 'components/dialog';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { isInGracePeriod } from 'lib/plans';
import notices from 'notices';
import paths from '../../paths';

const PlanRemove = React.createClass( {
	propTypes: {
		cancelSitePlanTrial: React.PropTypes.func.isRequired,
		isUpdating: React.PropTypes.bool.isRequired,
		plan: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return {
			showDialog: false
		};
	},

	removePlan( closeDialog ) {
		this.props.cancelSitePlanTrial( this.props.selectedSite.ID, this.props.plan.id ).then( () => {
			Dispatcher.handleViewAction( {
				type: 'FETCH_SITES'
			} );

			page( paths.plansDestination( this.props.selectedSite.slug, 'free-trial-canceled' ) );
		} ).catch( ( error ) => {
			closeDialog();

			notices.error( error );
		} );
	},

	closeDialog() {
		this.setState( {
			showDialog: false
		} );
	},

	showDialog( event ) {
		event.preventDefault();

		this.setState( { showDialog: true } );
	},

	renderCard() {
		return (
			<CompactCard className="plan-remove">
				{ this.translate( '{{strong}}Not looking to purchase?{{/strong}} No problem, you can remove the plan and all its features from your site.', {
					components: {
						strong: <strong />
					}
				} ) }
				{ ' ' }
				<a href="#" onClick={ this.showDialog }>{ this.translate( 'Remove now' ) }</a>.
			</CompactCard>
		);
	},

	renderDialog() {
		const buttons = [
			{
				action: 'cancel',
				disabled: this.props.isUpdating,
				label: this.translate( 'Cancel' )
			},
			{
				action: 'remove',
				disabled: this.props.isUpdating,
				isPrimary: true,
				label: this.translate( 'Remove Now' ),
				onClick: this.removePlan
			}
		];

		return (
			<Dialog
				buttons={ buttons }
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }>
				<h1>{ this.translate( 'Remove Free Trial' ) }</h1>

				<p>
					{ this.translate( 'Are you sure you want to end your {{strong}}%(planName)s{{/strong}} free trial and remove it from {{em}}%(siteName)s{{/em}}?', {
						args: {
							planName: this.props.plan.productName,
							siteName: this.props.selectedSite.name || this.props.selectedSite.title
						},
						components: {
							em: <em />,
							strong: <strong />
						}
					} ) }
					{ ' ' }
					{ this.translate( 'You will lose any custom changes you have made.' ) }
				</p>
			</Dialog>
		);
	},

	render() {
		if ( isInGracePeriod( this.props.plan ) ) {
			return (
				<div>
					{ this.renderCard() }
					{ this.renderDialog() }
				</div>
			);
		}

		return null;
	}
} );

export default connect(
	( state, props ) => {
		const plans = getPlansBySite( state, props.selectedSite );

		return {
			isUpdating: plans.isUpdating
		};
	},
	( dispatch ) => {
		return {
			cancelSitePlanTrial: ( siteId, planId ) => {
				return dispatch( cancelSitePlanTrial( siteId, planId ) );
			}
		};
	}
)( PlanRemove );
