/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Navigation from './navigation';
import Button from 'components/button';

class SimplePaymentsDialog extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'paymentButtons', 'addNew' ] ).isRequired,
		showDialog: PropTypes.bool.isRequired,
		isEdit: PropTypes.bool.isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	};

	getActionButtons() {
		const { translate, onClose } = this.props;

		const actionButtons = [
			<Button onClick={ onClose }>
				{ translate( 'Cancel' ) }
			</Button>
		];

		if ( this.props.activeTab === 'addNew' ) {
			return [
				...actionButtons,
				<Button onClick={ noop } primary>
					{ translate( 'Add' ) }
				</Button>
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

export default connect()( localize( SimplePaymentsDialog ) );
