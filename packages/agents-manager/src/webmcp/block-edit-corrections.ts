import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { errorResult } from '../abilities/ability-result';
import { deepClone } from '../utils/deep-clone';
import { isRecord } from '../utils/is-record';
import { APPLY_BLOCK_EDITS_ABILITY_NAME, GET_BLOCK_TREE_ABILITY_NAME } from './contracts';
import { getBlockTreeBlocks } from './tool-calls';
import type { AbilityResult } from '../abilities/types';
import type { ToolProvider } from '../extension-types';

const CORRECT_BLOCK_EDITS_PATH = '/wp-abilities/v1/abilities/wpcom/correct-block-edits/run';

type Correction = { edits: Record< string, unknown > } | AbilityResult[ 'result' ];

/**
 * Runs WebMCP block edits through `wpcom/correct-block-edits` first, so they get the checks and
 * fixes the chat's block edits get. Sites that don't serve it, such as Atomic sites, apply the
 * edits as sent.
 */
export function withBlockEditCorrections( toolProvider: ToolProvider ): ToolProvider {
	return {
		getAbilities: () => toolProvider.getAbilities(),
		executeAbility: async ( name, input ) => {
			if ( name !== APPLY_BLOCK_EDITS_ABILITY_NAME ) {
				return toolProvider.executeAbility( name, input );
			}

			const tree = await toolProvider.executeAbility( GET_BLOCK_TREE_ABILITY_NAME, {} );
			const blocks = getBlockTreeBlocks( tree );

			if ( ! blocks ) {
				return tree;
			}

			const { reverseMap, ...edits } = input;
			let correction: Correction;

			try {
				correction = await apiFetch< Correction >( {
					method: 'POST',
					path: addQueryArgs( CORRECT_BLOCK_EDITS_PATH, { webmcp: 1 } ),
					data: {
						input: {
							// Plain JSON: on Simple sites `apiFetch` posts through a proxy iframe whose
							// structured clone drops the text of parsed markup's `RichTextData`.
							edits: deepClone( edits ),
							context: { 'client.gutenberg_page.current_page_content': blocks },
						},
					},
				} );
			} catch ( error ) {
				if ( isRecord( error ) && error.code === 'rest_ability_not_found' ) {
					return toolProvider.executeAbility( name, input );
				}

				return errorResult(
					isRecord( error ) && typeof error.message === 'string' ? error.message : String( error )
				);
			}

			if ( ! ( 'edits' in correction ) ) {
				return { result: correction, returnToAgent: true };
			}

			return toolProvider.executeAbility( name, { ...correction.edits, reverseMap } );
		},
	};
}
