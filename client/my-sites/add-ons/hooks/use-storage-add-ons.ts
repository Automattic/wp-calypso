import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import useAddOns from './use-add-ons';

interface Props {
	siteId?: number | null;
	isInSignup?: boolean;
}
const useStorageAddOns = ( { siteId, isInSignup }: Props ) => {
	const addOns = useAddOns( siteId ?? undefined, isInSignup );

	return useMemo(
		() => addOns.filter( ( addOn ) => addOn?.productSlug === PRODUCT_1GB_SPACE ),
		[ addOns ]
	);
};

export default useStorageAddOns;
