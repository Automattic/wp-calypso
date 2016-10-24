/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addCurrentPlanToCartAndRedirect, getCurrentPlan, getDayOfTrial } from 'lib/plans';
import Notice from 'components/notice';

const FreeTrialNotice = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		sitePlans: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	addPlanAndRedirect( event ) {
		event.preventDefault();

		addCurrentPlanToCartAndRedirect( this.props.sitePlans, this.props.selectedSite );
	},

	render() {
		const { cart, sitePlans } = this.props,
			isDataLoading = ! cart.hasLoadedFromServer || ! sitePlans.hasLoadedFromServer,
			currentPlan = getCurrentPlan( sitePlans.data );

		if ( isDataLoading || ! currentPlan.freeTrial ) {
			return null;
		}

		return (
			<Notice
				status="is-info"
				showDismiss={ false }>
				{
					i18n.translate( 'You are currently on day %(day)d of your %(planName)s trial.', {
						args: {
							day: getDayOfTrial( currentPlan ),
							planName: currentPlan.productName
						}
					} )
				}
				{ ' ' }
				{
					i18n.translate( 'Get a free domain when you {{a}}upgrade{{/a}}.', {
						components: {
							a: <a
								href="#"
								onClick={ this.addPlanAndRedirect } />
						}
					} )
				}
			</Notice>
		);
	}
} );

export default FreeTrialNotice;
