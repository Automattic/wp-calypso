/**
 * External dependencies
 */
import React from 'react';
import Dispatcher from 'dispatcher';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import { clearSitePlans } from 'state/sites/plans/actions';
import FreeTrialForm from './free-trial-form';

const StartTrial = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	onSubmit: function() {
		// invalidate `sitePlans` (/sites/:site/plans)
		this.props.clearSitePlans();

		// Refresh all sites (/sites) to have an updated `site.plan` value.
		Dispatcher.handleViewAction( {
			type: 'FETCH_SITES'
		} );
	},

	render: function() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( ! selectedSite ) {
			return <FreeTrialForm.Placeholder />
		}

		return (
			<FreeTrialForm
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				site={ selectedSite }
				redirectTo={ `/plans/${ selectedSite.slug }/thank-you` }
				onSubmit={ this.onSubmit } />
		);
	}
} );

export default connect(
	undefined,
	function mapDispatchToProps( dispatch, ownProps ) {
		return {
			clearSitePlans() {
				const selectedSite = ownProps.sites.getSelectedSite();
				if ( selectedSite ) {
					dispatch( clearSitePlans( selectedSite.ID ) );
				}
			}
		};
	}
)( StartTrial );
