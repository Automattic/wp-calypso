import { __ } from '@wordpress/i18n';
import wpcom from 'calypso/lib/wp';

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
		get label() {
			return __( 'Sell courses and generate income' );
		},
		plugins: [],
	},
	{
		id: 'provide_certification',
		get label() {
			return __( 'Provide certification' );
		},
		plugins: [
			{
				slug: 'sensei-certificates',
				id: 'sensei-certificates/woothemes-sensei-certificates',
			},
		],
		get description() {
			return __( 'Sensei LMS Certificates will be installed for free.' );
		},
	},
	{
		id: 'educate_students',
		get label() {
			return __( 'Educate students' );
		},
	},
	{
		id: 'train_employees',
		get label() {
			return __( 'Train employees' );
		},
	},
];
const STORAGE_KEY = 'sensei-site-purpose';

export function setSelectedPurposes( value: SitePurpose ) {
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

export async function saveSelectedPurposesAsSenseiSiteSettings( siteSlug: string ) {
	const purpose = getSelectedPurposes();
	if ( ! purpose || ! siteSlug ) {
		return;
	}
	try {
		return await wpcom.req.post(
			{
				path: `/sites/${ siteSlug }/settings`,
				apiNamespace: 'wp/v2',
			},
			{
				sensei_setup_wizard_data: { purpose },
			}
		);
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.error( 'Failed to save Sensei purpose step data', e );
		return false;
	}
}
