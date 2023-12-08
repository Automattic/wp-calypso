import type { ResponseCart } from '@automattic/shopping-cart';

export type OnChangeAkProQuantity = (
	uuid: Readonly< string >,
	productSlug: string,
	productId: number,
	prevQuantity: number | null,
	newQuantity: number | null
) => void;

export interface AkismetProQuantityDropDownProps {
	id: string;
	responseCart: ResponseCart;
	setForceShowAkQuantityDropdown: React.Dispatch< React.SetStateAction< boolean > >;
	onChangeAkProQuantity: OnChangeAkProQuantity;
	toggle: ( id: string | null ) => void;
	isOpen: boolean;
}
