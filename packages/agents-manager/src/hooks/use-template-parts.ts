import { serialize } from '@wordpress/blocks';
import { store as coreStore } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';

interface ThemeRecord {
	stylesheet: string;
}

export default function useTemplateParts() {
	const { getCurrentTheme, getEntityRecord } = useSelect(
		( select ) =>
			select( coreStore ) as {
				getCurrentTheme: () => ThemeRecord;
				getEntityRecord: (
					kind: string,
					name: string,
					key: string
				) => Record< string, unknown > | undefined;
			},
		[]
	);
	const { editEntityRecord } = useDispatch( coreStore );

	const buildTemplatePartId = useCallback(
		( templatePartName: string ): string => {
			return `${ getCurrentTheme().stylesheet }//${ templatePartName }`;
		},
		[ getCurrentTheme ]
	);

	const editTemplatePart = useCallback(
		async ( templatePartId: string, blocks: unknown[] ) => {
			const record = getEntityRecord( 'postType', 'wp_template_part', templatePartId );
			if ( ! record ) {
				return;
			}

			await editEntityRecord( 'postType', 'wp_template_part', templatePartId, {
				blocks,
				content: serialize( blocks as Parameters< typeof serialize >[ 0 ] ),
			} );
		},
		[ editEntityRecord, getEntityRecord ]
	);

	const replaceTemplatePart = useCallback(
		async ( templatePartName: string, blocks: unknown[] ) => {
			const templatePartId = buildTemplatePartId( templatePartName );
			await editTemplatePart( templatePartId, blocks );
		},
		[ buildTemplatePartId, editTemplatePart ]
	);

	return { buildTemplatePartId, editTemplatePart, replaceTemplatePart };
}
