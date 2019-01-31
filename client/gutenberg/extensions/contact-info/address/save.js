/** @format */
/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const Address = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
} ) => (
	<Fragment>
		{ address && (
			<div itemprop="streetAddress" class="jetpack-address__address jetpack-address__address1">
				{ address }
			</div>
		) }
		{ addressLine2 && (
			<div itemprop="streetAddress" class="jetpack-address__address jetpack-address__address2">
				{ addressLine2 }
			</div>
		) }
		{ addressLine3 && (
			<div itemprop="streetAddress" class="jetpack-address__address jetpack-address__address3">
				{ addressLine3 }
			</div>
		) }
		{ city && ! ( region || postal ) && (
			<div itemprop="addressLocality" class="jetpack-address__city">
				{ city }
			</div>
		) }
		{ city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressLocality" class="jetpack-address__city">
						{ city }
					</span>,
					', ',
					<span itemprop="addressRegion" class="jetpack-address__region">
						{ region }
					</span>,
					' ',
					<span itemprop="postalCode" class="jetpack-address__postal">
						{ postal }
					</span>,
				] }
			</div>
		) }
		{ ! city && ( region || postal ) && (
			<div>
				{ [
					<span itemprop="addressRegion" class="jetpack-address__region">
						{ region }
					</span>,
					' ',
					<span itemprop="postalCode" class="jetpack-address__postal">
						{ postal }
					</span>,
				] }
			</div>
		) }
		{ country && (
			<div itemprop="addressCountry" class="jetpack-address__country">
				{ country }
			</div>
		) }
	</Fragment>
);

export const googleMapsUrl = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
} ) => {
	const addressUrl = address ? `${ address },` : '';
	const addressLine2Url = addressLine2 ? `${ addressLine2 },` : '';
	const addressLine3Url = addressLine3 ? `${ addressLine3 },` : '';
	const cityUrl = city ? `+${ city },` : '';
	let regionUrl = region ? `+${ region },` : '';
	regionUrl = postal ? `${ regionUrl }+${ postal }` : regionUrl;
	const countryUrl = country ? `+${ country }` : '';

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
			<a
				href={ googleMapsUrl( props ) }
				target="_blank"
				rel="noopener noreferrer"
				title={ __( 'Open address in Google Maps' ) }
			>
				<Address { ...props } />
			</a>
		) }
		{ ! props.attributes.linkToGoogleMaps && <Address { ...props } /> }
	</div>
);

export default save;
