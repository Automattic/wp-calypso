/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Navigation from './navigation';

class SimplePaymentsDialog extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'paymentButtons', 'addNew' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	};

	getActionButtons() {
		const actionButtons = [
			// Cancel
		];

		if ( this.props.activeTab === 'addNew' ) {
			return [
				// + Add
				...actionButtons
			];
		}

		return actionButtons;
	}

	render() {
		const {
			activeTab,
			showDialog,
			onChangeTabs,
			onClose,
		} = this.props;

		const content = activeTab === 'addNew'
			? <div>Add new</div>
			: <div>Payment Buttons list</div>;

		return (
			<Dialog
				isVisible={ showDialog }
				onClose={ onClose }
				buttons={ this.getActionButtons() }
				additionalClassNames="editor-simple-payments-modal"
			>
				<Navigation { ...{ activeTab, onChangeTabs } } />
				{ content }
			</Dialog>
		);
	}
}

export default connect( state => {
	return {};
} )( SimplePaymentsDialog );
