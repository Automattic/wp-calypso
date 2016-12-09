/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmailForwardingStore from 'lib/domains/email-forwarding/store';
import StoreConnection from 'components/data/store-connection';
import * as upgradesActions from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';

function getStateFromStores( props ) {
	return {
		emailForwarding: EmailForwardingStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
	};
}

export class EmailForwardingData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.loadEmailForwarding();
	}

	componentWillUpdate() {
		this.loadEmailForwarding();
	}

	loadEmailForwarding = () => {
		upgradesActions.fetchEmailForwarding( this.props.selectedDomainName );
	};

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ [ EmailForwardingStore ] }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite }
			/>
		);
	}
}

const mapStateToProps = state => ( {
	selectedSite: getSelectedSite( state ),
} );

export default connect( mapStateToProps )( EmailForwardingData );
