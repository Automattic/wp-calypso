import { __ } from '@wordpress/i18n';

export type SitePurpose = {
	selected: string[];
	other: string;
};

export type Plugin = {
	id?: string;
	slug: string;
	softwareSet?: string;
};

type Purpose = {
	id: string;
	label: string;
	plugins?: Array< Plugin >;
	description?: string;
};

export const purposes: Purpose[] = [
	{
		id: 'sell_courses',
		label: __( 'Sell courses and generate income' ),
		plugins: [
			{
				softwareSet: 'woo-on-plans',
				slug: 'woocommerce',
			},
			{
				slug: 'woocommerce-google-analytics-integration',
				id: 'woocommerce-google-analytics-integration/woocommerce-google-analytics-integration',
			},
		],
		description: __( 'WooCommerce will be installed for free.' ),
	},
	{
		id: 'provide_certification',
		label: __( 'Provide certification' ),
		plugins: [
			{
				slug: 'sensei-certificates',
				id: 'sensei-certificates/woothemes-sensei-certificates',
			},
		],
		description: __( 'Sensei LMS Certificates will be installed for free.' ),
	},
	{
		id: 'educate_students',
		label: __( 'Educate students' ),
	},
	{
		id: 'train_employees',
		label: __( 'Train employees' ),
	},
];
const STORAGE_KEY = 'sensei-site-purpose';

export function saveSelectedPurposes( value: SitePurpose ) {
	window.sessionStorage.setItem( STORAGE_KEY, ( value && JSON.stringify( value ) ) || '' );
}

export function clearSelectedPurposes() {
	window.sessionStorage.removeItem( STORAGE_KEY );
}

export function getSelectedPurposes(): SitePurpose {
	const storedValue = window.sessionStorage.getItem( STORAGE_KEY );
	let parsedValue;
	try {
		parsedValue = storedValue && JSON.parse( storedValue );
	} catch ( e ) {}
	return parsedValue || { selected: [], other: '' };
}

export function getSelectedPlugins(): Plugin[] {
	const { selected } = getSelectedPurposes();
	return purposes
		.filter( ( purpose ) => selected.includes( purpose.id ) )
		.reduce(
			( plugins, purpose ) =>
				purpose.plugins ? plugins.concat( purpose.plugins as [] ) : plugins,
			[]
		);
}
