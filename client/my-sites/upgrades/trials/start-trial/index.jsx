/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import FreeTrialForm from './free-trial-form';

const StartTrial = React.createClass( {
	mixins: [ observe( 'sites' ) ],

	render: function() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( ! selectedSite ) {
			return <FreeTrialForm.Placeholder />
		}

		return (
			<FreeTrialForm
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				selectedSite={ selectedSite }
				redirectTo={ `/plans/${ selectedSite.slug }/thank-you` } />
		);
	}
} );

export default StartTrial;
