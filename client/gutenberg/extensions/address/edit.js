/** @format */

/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

class AddressEdit extends Component {
	constructor( ...args ) {
		super( ...args );
	}

	render() {
		const {
			attributes: { address, address_line2, city, region, postal, country },
			className,
			isSelected,
			setAttributes,
		} = this.props;

		const hasContent =
			[ address, address_line2, city, region, postal, country ]
				.map( value => value !== '' )
				.filter( Boolean ).length > 0;

		return (
			<div className={ isSelected ? 'jetpack-phone-block is-selected' : 'jetpack-phone-block' }>
				{ ! isSelected &&
					hasContent && (
						<div className={ className }>
							{ address && <div>{ address }</div> }
							{ address_line2 && <div>{ address_line2 }</div> }
							{ city && ! ( region || postal ) && <div>{ city }</div> }
							{ city &&
								( region || postal ) && (
									<div>{ sprintf( __( '%s, %s  %s' ), city, region, postal ) }</div>
								) }
							{ ! city &&
								( region || postal ) && <div>{ sprintf( __( '%s  %s' ), region, postal ) }</div> }
							{ country && <div>{ country }</div> }
						</div>
					) }
				{ ( isSelected || ! hasContent ) && (
					<Fragment>
						<PlainText
							value={ address }
							placeholder={ __( 'Street Address' ) }
							onChange={ newAddress => setAttributes( { address: newAddress } ) }
						/>
						<PlainText
							value={ address_line2 }
							placeholder={ __( 'Address Line 2' ) }
							onChange={ newAddressLine2 => setAttributes( { address_line2: newAddressLine2 } ) }
						/>
						<PlainText
							value={ city }
							placeholder={ __( 'City' ) }
							onChange={ newCity => setAttributes( { city: newCity } ) }
						/>
						<PlainText
							value={ region }
							placeholder={ __( 'State/Provice/Region' ) }
							onChange={ newRegion => setAttributes( { region: newRegion } ) }
						/>
						<PlainText
							value={ postal }
							placeholder={ __( 'Postal/Zip Code' ) }
							onChange={ newPostal => setAttributes( { postal: newPostal } ) }
						/>
						<PlainText
							value={ country }
							placeholder={ __( 'Country' ) }
							onChange={ newCountry => setAttributes( { country: newCountry } ) }
						/>
					</Fragment>
				) }
			</div>
		);
	}
}

export default AddressEdit;
