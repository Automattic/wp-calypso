/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import SectionHeader from 'client/components/section-header';
import HeaderCake from 'client/components/header-cake';
import Button from 'client/components/button';

class SimplePaymentsDialogNavigation extends Component {
	static propTypes = {
		activeTab: PropTypes.oneOf( [ 'list', 'form' ] ).isRequired,
		onChangeTabs: PropTypes.func.isRequired,
		paymentButtons: PropTypes.array,
	};

	onChangeTabs = tab => () => this.props.onChangeTabs( tab );

	render() {
		const { paymentButtons, activeTab, translate } = this.props;

		const classNames = 'editor-simple-payments-modal__navigation';

		if ( activeTab === 'form' ) {
			// Navigation for the editing form
			return (
				<HeaderCake
					className={ classNames }
					onClick={ this.onChangeTabs( 'list' ) }
					backText={ translate( 'Payment Buttons' ) }
				/>
			);
		}

		// We are on "Payment Buttons" view.
		if ( ! paymentButtons ) {
			// Render an empty SectionHeader as a placeholder
			return <SectionHeader className={ classNames } />;
		}

		return (
			<SectionHeader
				className={ classNames }
				label={ translate( 'Payment Buttons' ) }
				count={ paymentButtons.length }
			>
				<Button compact icon onClick={ this.onChangeTabs( 'form' ) }>
					<Gridicon icon="plus-small" /> { translate( 'Add New' ) }
				</Button>
			</SectionHeader>
		);
	}
}

export default localize( SimplePaymentsDialogNavigation );
