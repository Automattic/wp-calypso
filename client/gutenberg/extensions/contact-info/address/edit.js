/** @format */

/**
 * External dependencies
 */
import { RichText, InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { ToggleControl, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { default as save, googleMapsUrl } from './save';

class AddressEdit extends Component {
	constructor( ...args ) {
		super( ...args );

		this.unstableOnSplit = this.unstableOnSplit.bind( this );
	}

	unstableOnSplit = () => false;

	render() {
		const {
			attributes: {
				address,
				addressLine2,
				addressLine3,
				city,
				region,
				postal,
				country,
				linkToGoogleMaps,
			},
			isSelected,
			setAttributes,
		} = this.props;

		const hasContent =
			[ address, addressLine2, addressLine3, city, region, postal, country ]
				.map( value => value !== '' )
				.filter( Boolean ).length > 0;

		const formattingControls = [];

		return (
			<div className={ isSelected ? 'jetpack-address-block is-selected' : 'jetpack-address-block' }>
				{ ! isSelected && hasContent && save( this.props ) }
				{ ( isSelected || ! hasContent ) && (
					<Fragment>
						<RichText
							value={ address }
							placeholder={ __( 'Street Address' ) }
							onChange={ newAddress =>
								setAttributes( { address: newAddress.replace( '<br>', '' ) } )
							}
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ addressLine2 }
							placeholder={ __( 'Address Line 2' ) }
							onChange={ newAddressLine2 =>
								setAttributes( { addressLine2: newAddressLine2.replace( '<br>', '' ) } )
							}
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ addressLine3 }
							placeholder={ __( 'Address Line 3' ) }
							onChange={ newAddressLine3 =>
								setAttributes( { addressLine3: newAddressLine3.replace( '<br>', '' ) } )
							}
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ city }
							placeholder={ __( 'City' ) }
							onChange={ newCity => setAttributes( { city: newCity.replace( '<br>', '' ) } ) }
							keepPlaceholderOnFocus
							formattingControls={ [ 'bold', 'italic', 'link' ] }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ region }
							placeholder={ __( 'State/Province/Region' ) }
							onChange={ newRegion => setAttributes( { region: newRegion.replace( '<br>', '' ) } ) }
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ postal }
							placeholder={ __( 'Postal/Zip Code' ) }
							onChange={ newPostal => setAttributes( { postal: newPostal.replace( '<br>', '' ) } ) }
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<RichText
							value={ country }
							placeholder={ __( 'Country' ) }
							onChange={ newCountry =>
								setAttributes( { country: newCountry.replace( '<br>', '' ) } )
							}
							keepPlaceholderOnFocus
							formattingControls={ formattingControls }
							unstableOnSplit={ this.unstableOnSplit }
						/>
						<InspectorControls>
							<PanelBody title={ __( 'Link to Google Maps' ) }>
								<ToggleControl
									label={ __( 'Link address to Google Maps' ) }
									help={ googleMapsUrl( this.props ) }
									checked={ linkToGoogleMaps }
									onChange={ newlinkToGoogleMaps =>
										setAttributes( { linkToGoogleMaps: newlinkToGoogleMaps } )
									}
								/>
							</PanelBody>
						</InspectorControls>
					</Fragment>
				) }
			</div>
		);
	}
}

export default AddressEdit;
