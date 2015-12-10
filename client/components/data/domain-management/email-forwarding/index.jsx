/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailForwardingStore from 'lib/domains/email-forwarding/store';
import StoreConnection from 'components/data/store-connection';
import observe from 'lib/mixins/data-observe';
import * as upgradesActions from 'lib/upgrades/actions';

function getStateFromStores( props ) {
	return {
		emailForwarding: EmailForwardingStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

const EmailForwardingData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		this.loadEmailForwarding();
	},

	componentWillUpdate() {
		this.loadEmailForwarding();
	},

	loadEmailForwarding() {
		upgradesActions.fetchEmailForwarding( this.props.selectedDomainName );
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ [ EmailForwardingStore ] }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );

export default EmailForwardingData;
