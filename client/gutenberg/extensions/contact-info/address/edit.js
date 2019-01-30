/** @format */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { PlainText, InspectorControls } from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { ToggleControl, PanelBody, ExternalLink } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import ClipboardInput from 'gutenberg/extensions/presets/jetpack/utils/clipboard-input';
import { default as save, googleMapsUrl } from './save';

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

		const hasContent = [ address, addressLine2, addressLine3, city, region, postal, country ].some(
			value => value !== ''
		);
		const classNames = classnames( {
			'jetpack-address-block': true,
			'is-selected': isSelected,
		} );

		return (
			<div className={ classNames }>
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
						<InspectorControls>
							<PanelBody title={ __( 'Link to Google Maps' ) }>
								<ToggleControl
									label={ __( 'Link address to Google Maps' ) }
									checked={ linkToGoogleMaps }
									onChange={ newlinkToGoogleMaps =>
										setAttributes( { linkToGoogleMaps: newlinkToGoogleMaps } )
									}
								/>
								{ hasContent && <ClipboardInput link={ googleMapsUrl( this.props ) } /> }
								{ hasContent && (
									<div>
										<ExternalLink href={ googleMapsUrl( this.props ) }>
											{ __( 'Visit Google Maps' ) }
										</ExternalLink>
									</div>
								) }
							</PanelBody>
						</InspectorControls>
					</Fragment>
				) }
			</div>
		);
	}
}

export default AddressEdit;
