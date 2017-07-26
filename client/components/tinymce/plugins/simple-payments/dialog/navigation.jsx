/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';

class SimplePaymentsDialogNavigation extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'list', 'form' ] ).isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		paymentButtons: PropTypes.array.isRequired,
	};

	onChangeTabs = tab => () => this.props.onChangeTabs( tab );

	render() {
		const { paymentButtons, activeTab, translate } = this.props;

		const classNames = 'editor-simple-payments-modal__navigation';

		if ( activeTab === 'form' ) {
			if ( ! paymentButtons.length ) {
				// We are on "Add New" view without previously made payment buttons.
				return null;
			}

			// We are on "Add New" view with previously made payment buttons.
			return (
				<HeaderCake
					className={ classNames }
					onClick={ this.onChangeTabs( 'list' ) }
					backText={ translate( 'Payment Buttons' ) }
				/>
			);
		}

		// We are on "Payment Buttons" view.
		return (
			<SectionHeader
				className={ classNames }
				label={ translate( 'Payment Buttons' ) }
				count={ paymentButtons.length }
			>
				<Button compact onClick={ this.onChangeTabs( 'form' ) }>
					{ translate( '+ Add New' ) }
				</Button>
			</SectionHeader>
		);
	}
}

export default localize( SimplePaymentsDialogNavigation );
