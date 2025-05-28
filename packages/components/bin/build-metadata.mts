import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'react-docgen-typescript';

type ComponentMetadata = {
	props: Record<
		string,
		{
			description: string;
			defaultValue: { value: any } | null;
			required: boolean;
			type: { name: string };
		}
	>;
};

/**
 * Allowlist of components to document. Eventually this should include every component in the
 * package, but for now we're only documenting the ones that are used in the design system docs.
 */
const DOCUMENTED_COMPONENTS: Record< string, string > = {
	Badge: 'core-badge/index.tsx',
	Tabs: 'tabs/index.tsx',
	'Tabs.TabList': 'tabs/tablist.tsx',
	'Tabs.Tab': 'tabs/tab.tsx',
	'Tabs.TabPanel': 'tabs/tabpanel.tsx',
};

/**
 * Given an object and an array of keys, return a new object with only the keys that are in the array.
 * @param obj The object to pick keys from.
 * @param keys The keys to pick from the object.
 * @returns A new object with only the keys that are in the array.
 */
const pick = < O extends Record< string, any >, K extends Array< keyof O > >(
	obj: O,
	keys: K
): Pick< O, K[ number ] > =>
	Object.fromEntries( Object.entries( obj ).filter( ( [ key ] ) => keys.includes( key ) ) ) as Pick<
		O,
		K[ number ]
	>;

/**
 * Given an object and a function, return a new object with the values of the object mapped by the function.
 * @param obj The object to map values from.
 * @param fn The function to map the values of the object.
 * @returns A new object with the values of the object mapped by the function.
 */
const mapValues = < V, MV >(
	obj: Record< string, V >,
	fn: ( value: V ) => MV
): Record< string, MV > =>
	Object.fromEntries( Object.entries( obj ).map( ( [ key, value ] ) => [ key, fn( value ) ] ) );

/**
 * Given a file path, parse the component and return the metadata used for compiling props reference
 * of the component.
 * @param file The file path to parse.
 * @returns The component metadata.
 */
async function getMetadataEntry( file: string ): Promise< ComponentMetadata > {
	const parsed = await parse( join( process.cwd(), 'src', file ), {
		shouldExtractLiteralValuesFromEnum: true,
		shouldRemoveUndefinedFromOptional: true,
		propFilter: ( prop ) => ! prop.parent || ! /node_modules/.test( prop.parent.fileName ),
		savePropValueAsString: true,
	} );

	const [ { props } ] = parsed;
	return {
		props: mapValues( props, ( value ) =>
			pick( value, [ 'description', 'defaultValue', 'required', 'type' ] )
		),
	};
}

const metadata = Object.fromEntries(
	await Promise.all(
		Object.entries( DOCUMENTED_COMPONENTS ).map( async ( [ displayName, file ] ) => [
			displayName,
			await getMetadataEntry( file ),
		] )
	)
);

await mkdir( 'dist/types', { recursive: true } );

await Promise.all( [
	writeFile( 'dist/metadata.js', `export default ${ JSON.stringify( metadata, null, 2 ) };` ),
	writeFile(
		'dist/types/metadata.d.ts',
		`declare const metadata: Record< string, {
	props: Record< string, {
		description: string;
		defaultValue: { value: any } | null;
		required: boolean;
		type: { name: string; };
	} >;
} >;

export default metadata;`
	),
] );
