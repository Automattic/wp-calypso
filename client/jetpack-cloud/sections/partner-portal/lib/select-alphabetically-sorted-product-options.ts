import sortBy from 'lodash/sortBy';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

function selectProductOptions( families: APIProductFamily[] ): APIProductFamilyProduct[] {
	return families.flatMap( ( family ) => family.products );
}

export default function selectAlphabeticallySortedProductOptions(
	families: APIProductFamily[]
): APIProductFamilyProduct[] {
	return sortBy( selectProductOptions( families ), ( product ) => product.name );
}
