import {
	DIRECTORY_JETPACK,
	DIRECTORY_PRESSABLE,
	DIRECTORY_WOOCOMMERCE,
	DIRECTORY_WPCOM,
} from '../constants';

export function getPartnerDirectoryLabel( directory: string ): string {
	return (
		{
			[ DIRECTORY_WPCOM ]: 'WordPress.com',
			[ DIRECTORY_WOOCOMMERCE ]: 'WooCommerce.com',
			[ DIRECTORY_JETPACK ]: 'Jetpack.com',
			[ DIRECTORY_PRESSABLE ]: 'Pressable.com',
		}[ directory ] ?? ''
	);
}
