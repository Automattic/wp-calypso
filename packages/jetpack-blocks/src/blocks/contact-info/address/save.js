/**
 * External dependencies
 */
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { __ } from '../../../utils/i18n';

const hasAddress = ( { address, addressLine2, addressLine3, city, region, postal, country } ) => {
	return [ address, addressLine2, addressLine3, city, region, postal, country ].some(
		value => value !== ''
	);
};

const Address = ( {
	attributes: { address, addressLine2, addressLine3, city, region, postal, country },
} ) => (
	<Fragment>
		{ address && (
			<div className="jetpack-address__address jetpack-address__address1">{ address }</div>
		) }
		{ addressLine2 && (
			<div className="jetpack-address__address jetpack-address__address2">{ addressLine2 }</div>
		) }
		{ addressLine3 && (
			<div className="jetpack-address__address jetpack-address__address3">{ addressLine3 }</div>
		) }
		{ city && ! ( region || postal ) && <div className="jetpack-address__city">{ city }</div> }
		{ city && ( region || postal ) && (
			<div>
				{ [
					<span className="jetpack-address__city">{ city }</span>,
					', ',
					<span className="jetpack-address__region">{ region }</span>,
					' ',
					<span className="jetpack-address__postal">{ postal }</span>,
				] }
			</div>
		) }
		{ ! city && ( region || postal ) && (
			<div>
				{ [
					<span className="jetpack-address__region">{ region }</span>,
					' ',
					<span className="jetpack-address__postal">{ postal }</span>,
				] }
			</div>
		) }
		{ country && <div className="jetpack-address__country">{ country }</div> }
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

const save = props =>
	hasAddress( props.attributes ) && (
		<div className={ props.className }>
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
