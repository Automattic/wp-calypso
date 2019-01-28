/** @format */
/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const Address = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
} ) => (
	<Fragment>
		{ address && <div itemprop="streetAddress">{ <RichText.Content value={ address } /> }</div> }
		{ addressLine2 && (
			<div itemprop="streetAddress">{ <RichText.Content value={ addressLine2 } /> }</div>
		) }
		{ addressLine3 && (
			<div itemprop="streetAddress">{ <RichText.Content value={ addressLine3 } /> }</div>
		) }
		{ city && ! ( region || postal ) && (
			<div itemprop="addressLocality">{ <RichText.Content value={ city } /> }</div>
		) }
		{ city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressLocality">{ <RichText.Content value={ city } /> }</span>,
					', ',
					<span itemprop="addressRegion">{ <RichText.Content value={ region } /> }</span>,
					' ',
					<span itemprop="postalCode">{ <RichText.Content value={ postal } /> }</span>,
				] }
			</div>
		) }
		{ ! city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressRegion">{ <RichText.Content value={ region } /> }</span>,
					' ',
					<span itemprop="postalCode">{ <RichText.Content value={ postal } /> }</span>,
				] }
			</div>
		) }
		{ country && <div itemprop="addressCountry">{ <RichText.Content value={ country } /> }</div> }
	</Fragment>
);

export const googleMapsUrl = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
} ) => {
	const addressUrl = address ? `${ address },`.replace( /<(?:.|\n)*?>/gm, '' ) : '';
	const addressLine2Url = addressLine2 ? `${ addressLine2 },`.replace( /<(?:.|\n)*?>/gm, '' ) : '';
	const addressLine3Url = addressLine3 ? `${ addressLine3 },`.replace( /<(?:.|\n)*?>/gm, '' ) : '';
	const cityUrl = city ? `+${ city },`.replace( /<(?:.|\n)*?>/gm, '' ) : '';
	let regionUrl = region ? `+${ region },`.replace( /<(?:.|\n)*?>/gm, '' ) : '';
	regionUrl = postal ? `${ regionUrl }+${ postal }`.replace( /<(?:.|\n)*?>/gm, '' ) : regionUrl;
	const countryUrl = country ? `+${ country }`.replace( /<(?:.|\n)*?>/gm, '' ) : '';

	return `https://www.google.com/maps/search/${ addressUrl }${ addressLine2Url }${ addressLine3Url }${ cityUrl }${ regionUrl }${ countryUrl }`.replace(
		' ',
		'+'
	);
};

const save = props => (
	<div
		className={ props.className }
		itemprop="address"
		itemscope
		itemtype="http://schema.org/PostalAddress"
	>
		{ props.attributes.linkToGoogleMaps && (
			<a href={ googleMapsUrl( props ) } title={ __( 'Open address in Google Maps' ) }>
				<Address { ...props } />
			</a>
		) }
		{ ! props.attributes.linkToGoogleMaps && <Address { ...props } /> }
	</div>
);

export default save;
