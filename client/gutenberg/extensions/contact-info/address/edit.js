/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import save from './save';

class AddressEdit extends Component {
	constructor( ...args ) {
		super( ...args );

		this.preventEnterKey = this.preventEnterKey.bind( this );
	}

	preventEnterKey( event ) {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			return;
		}
	}

	render() {
		const {
			attributes: { address, addressLine2, addressLine3, city, region, postal, country },
			isSelected,
			setAttributes,
		} = this.props;

		const hasContent =
			[ address, addressLine2, addressLine3, city, region, postal, country ]
				.map( value => value !== '' )
				.filter( Boolean ).length > 0;

		return (
			<div className={ isSelected ? 'jetpack-phone-block is-selected' : 'jetpack-phone-block' }>
				{ ! isSelected && hasContent && save( this.props ) }
				{ ( isSelected || ! hasContent ) && (
					<Fragment>
						<PlainText
							value={ address }
							placeholder={ __( 'Street Address' ) }
							onChange={ newAddress => setAttributes( { address: newAddress } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ addressLine2 }
							placeholder={ __( 'Address Line 2' ) }
							onChange={ newAddressLine2 => setAttributes( { addressLine2: newAddressLine2 } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ addressLine3 }
							placeholder={ __( 'Address Line 3' ) }
							onChange={ newAddressLine3 => setAttributes( { addressLine3: newAddressLine3 } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ city }
							placeholder={ __( 'City' ) }
							onChange={ newCity => setAttributes( { city: newCity } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ region }
							placeholder={ __( 'State/Province/Region' ) }
							onChange={ newRegion => setAttributes( { region: newRegion } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ postal }
							placeholder={ __( 'Postal/Zip Code' ) }
							onChange={ newPostal => setAttributes( { postal: newPostal } ) }
							onKeyDown={ this.preventEnterKey }
						/>
						<PlainText
							value={ country }
							placeholder={ __( 'Country' ) }
							onChange={ newCountry => setAttributes( { country: newCountry } ) }
							onKeyDown={ this.preventEnterKey }
						/>
					</Fragment>
				) }
			</div>
		);
	}
}

export default AddressEdit;
