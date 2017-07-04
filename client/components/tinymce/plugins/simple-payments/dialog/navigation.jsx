/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import SectionHeader from 'components/section-header';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';

export default localize( class SimplePaymentsDialogNavigation extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'paymentButtons', 'addNew' ] ).isRequired,
		onChangeTabs: PropTypes.func.isRequired
	};

	onChangeTabs = ( tab ) => () => this.props.onChangeTabs( tab );

	render() {
		const { activeTab, translate } = this.props;

		// TODO: Get from store/as a prop.
		const paymentButtons = [ 1 ];

		const classNames = 'editor-simple-payments-modal__navigation';

		if ( activeTab === 'addNew' && ! paymentButtons.length ) {
			// We are on "Add New" view without previously made payment buttons.

			return null;
		} else if ( activeTab === 'addNew' ) {
			// We are on "Add New" view with previously made payment buttons.

			return (
				<HeaderCake
					className={ classNames }
					onClick={ this.onChangeTabs( 'paymentButtons') }
					backText={ translate( 'Payment Buttons' ) }
				>
				</HeaderCake>
			);
		} else {
			// We are on "Payment Buttons" view.

			return (
				<SectionHeader
					className={ classNames }
					label={ translate( 'Payment Buttons' ) }
					count={ 2 }
				>
					<Button
						compact
						onClick={ this.onChangeTabs( 'addNew' ) }
					>
						{ translate( '+ Add New' ) }
					</Button>
				</SectionHeader>
			);
		}

	}
} );
