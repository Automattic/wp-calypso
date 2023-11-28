import type { ResponseCart } from '@automattic/shopping-cart';

export type OnChangeAkProQuantity = (
	uuid: Readonly< string >,
	productSlug: Readonly< string >,
	productId: Readonly< number >,
	prevQuantity: Readonly< number | null >,
	newQuantity: number
) => void;

export interface AkismetProQuantityDropDownProps {
	responseCart: ResponseCart;
	onChangeAkProQuantity?: OnChangeAkProQuantity;
}
