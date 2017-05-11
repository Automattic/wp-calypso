/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
class AddressView extends Component {

	static propTypes = {
		address: PropTypes.shape( {
			name: PropTypes.string.isRequired,
			street: PropTypes.string.isRequired,
			city: PropTypes.string.isRequired,
			country: PropTypes.string.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );

		this.edit = this.edit.bind( this );
	}

	edit() {
		//TODO: Add edit functionality
		return false;
	}

	render() {
		const __ = i18n.translate;

		return (
			<div>
				<div className="address-view__address">
					<p className="address-view__address-name">
						{ this.props.address.name }
					</p>
					<p>{ this.props.address.street }</p>
					<p>{ this.props.address.city }</p>
					<p>{ this.props.address.country }</p>
				</div>
				<a>{ __( 'Edit address' ) }</a>
			</div>
		);
	}
}

export default AddressView;
