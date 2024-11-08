import { A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK } from '../sidebar-menu/lib/constants';

// This map is used to determine the product when the user is on a specific page to preselect the product in the form.
const pathToProductMap: Record< string, string > = {
	[ A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK ]: 'pressable',
};

export default function getDefaultProduct(): string {
	const product = pathToProductMap?.[ window.location.pathname ];

	return product || '';
}
