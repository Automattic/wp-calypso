/**
 * External dependencies
 */
import Dispatcher from 'dispatcher';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { isInGracePeriod } from 'lib/plans';
import notices from 'notices';
import paths from '../../paths';
import { fetchSitePlansCompleted } from 'state/sites/plans/actions';
import wpcom from 'lib/wp';

const PlanRemove = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		store: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			isCanceling: false,
			showDialog: false
		};
	},

	removePlan( closeDialog ) {
		this.setState( { isCanceling: true } );

		wpcom.undocumented().cancelPlanTrial( this.props.plan.id, ( error, data ) => {
			if ( data && data.success ) {
				this.props.store.dispatch( fetchSitePlansCompleted( this.props.selectedSite.ID, data.plans ) );

				Dispatcher.handleViewAction( {
					type: 'FETCH_SITES'
				} );

				page( paths.plansDestination( this.props.selectedSite.slug, 'free-trial-canceled' ) );
			} else {
				closeDialog();

				notices.error( error.message || this.translate( 'There was a problem removing the plan. Please try again later or contact support.' ) );
			}
		} );
	},

	closeDialog() {
		this.setState(  {
			isCanceling: false,
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
				disabled: this.state.isCanceling,
				label: this.translate( 'Cancel' )
			},
			{
				action: 'remove',
				disabled: this.state.isCanceling,
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

export default PlanRemove;
