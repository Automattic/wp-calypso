import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import useAddOns from './use-add-ons';

interface Props {
	siteId?: number | null;
}

const useStorageAddOns = ( { siteId }: Props ) => {
	const addOns = useAddOns( { selectedSiteId: siteId } );

	return useMemo(
		() => addOns.filter( ( addOn ) => addOn?.productSlug === PRODUCT_1GB_SPACE ),
		[ addOns ]
	);
};

export default useStorageAddOns;
