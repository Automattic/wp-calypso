import type { GlobalStyles } from '../components/styles-preview';

const withoutTypography = < T extends Record< string, unknown > >( obj: T ): T => {
	if ( ! ( 'typography' in obj ) ) {
		return obj;
	}
	const { typography: _typography, ...rest } = obj;
	return rest as unknown as T;
};

const mapValuesWithoutTypography = ( obj: Record< string, unknown > ): Record< string, unknown > =>
	Object.fromEntries(
		Object.entries( obj ).map( ( [ key, value ] ) => [
			key,
			value && typeof value === 'object'
				? withoutTypography( value as Record< string, unknown > )
				: value,
		] )
	);

/**
 * Strips the applied typography before a font variation merges, matching Big
 * Sky's apply behavior: `typography` is removed from the settings, the root
 * styles, and every element and block so the variation defines the type
 * treatment from scratch instead of key-merging over the previous font.
 */
export default function resetTypographyStyles( record: {
	settings?: GlobalStyles[ 'settings' ];
	styles?: GlobalStyles[ 'styles' ];
} ): { settings?: GlobalStyles[ 'settings' ]; styles?: GlobalStyles[ 'styles' ] } {
	const settings = record.settings
		? ( withoutTypography( record.settings as Record< string, unknown > ) as NonNullable<
				GlobalStyles[ 'settings' ]
		  > )
		: record.settings;

	let styles = record.styles;
	if ( styles ) {
		const next = withoutTypography( { ...styles } as Record< string, unknown > );
		if ( next.elements && typeof next.elements === 'object' ) {
			next.elements = mapValuesWithoutTypography( next.elements as Record< string, unknown > );
		}
		if ( next.blocks && typeof next.blocks === 'object' ) {
			next.blocks = mapValuesWithoutTypography( next.blocks as Record< string, unknown > );
		}
		styles = next as NonNullable< GlobalStyles[ 'styles' ] >;
	}

	return { settings, styles };
}
