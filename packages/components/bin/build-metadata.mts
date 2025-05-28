import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'react-docgen-typescript';

type ComponentMetadata = {
	props: Record<
		string,
		{
			description: string;
			defaultValue?: { value: any };
			required: boolean;
			type: { name: string };
		}
	>;
};

const DOCUMENTED_COMPONENTS = [ 'core-badge' ];

const files = DOCUMENTED_COMPONENTS.map( ( component ) => `${ component }/index.tsx` );

const pick = < O extends Record< string, any >, K extends Array< keyof O > >(
	obj: O,
	keys: K
): Pick< O, K[ number ] > =>
	Object.fromEntries( Object.entries( obj ).filter( ( [ key ] ) => keys.includes( key ) ) ) as Pick<
		O,
		K[ number ]
	>;

const mapValues = < V, MV >(
	obj: Record< string, V >,
	fn: ( value: V ) => MV
): Record< string, MV > =>
	Object.fromEntries( Object.entries( obj ).map( ( [ key, value ] ) => [ key, fn( value ) ] ) );

async function getMetadataEntry( file: string ): Promise< [ string, ComponentMetadata ] > {
	const parsed = await parse( join( process.cwd(), 'src', file ), {
		shouldExtractLiteralValuesFromEnum: true,
		shouldRemoveUndefinedFromOptional: true,
		propFilter: ( prop ) => ! prop.parent || ! /node_modules/.test( prop.parent.fileName ),
		savePropValueAsString: true,
	} );

	const [ { displayName, props } ] = parsed;
	return [
		displayName,
		{
			props: mapValues( props, ( value ) =>
				pick( value, [ 'description', 'defaultValue', 'required', 'type' ] )
			),
		},
	];
}

const metadata = Object.fromEntries( await Promise.all( files.map( getMetadataEntry ) ) );

await mkdir( 'dist/types', { recursive: true } );

await Promise.all( [
	writeFile( 'dist/metadata.js', `export default ${ JSON.stringify( metadata, null, 2 ) };` ),
	writeFile(
		'dist/types/metadata.d.ts',
		`declare const metadata: Record< string, {
	props: Record< string, {
		description: string;
		defaultValue?: { value: any };
		required: boolean;
		type: { name: string; };
	} >;
} >;

export default metadata;`
	),
] );
