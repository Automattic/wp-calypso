import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import type { GlobalStyles } from '../components/styles-preview';

/**
 * Reads the current global styles record and its ID from `@wordpress/core-data`.
 * Returns `null` values if the global styles ID is not yet available.
 */
export default function useGlobalStyles(): {
	globalStylesId: string | null;
	globalStyles: GlobalStyles | null;
} {
	return useSelect( ( select ) => {
		const core = select( coreStore ) as {
			__experimentalGetCurrentGlobalStylesId: () => string;
			getEditedEntityRecord: (
				kind: string,
				name: string,
				key: string
			) => Record< string, unknown >;
		};
		const id = core.__experimentalGetCurrentGlobalStylesId() ?? null;
		if ( ! id ) {
			return { globalStylesId: null, globalStyles: null };
		}
		return {
			globalStylesId: id,
			globalStyles: core.getEditedEntityRecord( 'root', 'globalStyles', id ) as GlobalStyles | null,
		};
	}, [] );
}
