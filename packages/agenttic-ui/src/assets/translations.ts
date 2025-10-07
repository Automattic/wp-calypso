// Dynamically import all Jed JSON files directly
const jedFiles = import.meta.glob(
	'../../../../languages/wpcom-agenttic-*.jed.json',
	{
		eager: true,
	}
);

export interface TranslationData {
	[ key: string ]: any;
}

// Create bundled translations map from parsed files
export const bundledTranslations: Record< string, TranslationData > = {};

Object.entries( jedFiles ).forEach( ( [ path, module ] ) => {
	// Extract locale from filename: wpcom-agenttic-es.jed.json -> es
	const filename = path.split( '/' ).pop()!;
	const locale = filename
		.replace( 'wpcom-agenttic-', '' )
		.replace( '.jed.json', '' );

	// Jed files contain translation objects directly
	bundledTranslations[ locale ] = ( module as any ).default;
} );

export function getBundledTranslation(
	locale: string
): TranslationData | null {
	return bundledTranslations[ locale ] || null;
}
