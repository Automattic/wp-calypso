/**
 * The chat's editor suggestions on Big Sky sites: design actions for the empty
 * view, and actions for the selected block. Their prompts lead to the editor
 * abilities, which the backend offers only where Big Sky is enabled.
 */
import { select } from '@wordpress/data';
import { __, _n, sprintf } from '@wordpress/i18n';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import type { EditorBlock } from './editor-blocks';
import type { Suggestion } from '@automattic/agenttic-ui';

type BlockSuggestionBuilder = ( block: EditorBlock ) => Suggestion | undefined;

interface QueryAttributes {
	inherit?: boolean;
	order?: string;
	perPage?: number | null;
}

// The Assembler theme's stylesheet on Simple, Atomic and local sites.
const ASSEMBLER_STYLESHEETS = new Set( [ 'pub/assembler', 'assembler-wpcom', 'assembler' ] );

// Page layouts and new pages come from the Assembler theme's patterns.
const ASSEMBLER_ONLY_SUGGESTION_IDS = new Set( [ 'change-page-layout', 'edit-pages' ] );

// What a query shows when it sets no `perPage`: WordPress's default posts per page.
const DEFAULT_POSTS_PER_PAGE = 10;

function isJetpackAiSidebarEnabled(): boolean {
	return getAgentsManagerInlineData()?.jetpackAiSidebar?.enabled === true;
}

function isAssemblerTheme(): boolean {
	const core = select( 'core' ) as {
		getCurrentTheme?: () => { stylesheet?: string } | undefined;
	};

	return ASSEMBLER_STYLESHEETS.has( core?.getCurrentTheme?.()?.stylesheet ?? '' );
}

/**
 * The block itself, or the first block under it, with the given name.
 * @param block - The block to search from.
 * @param name  - The block name to find.
 * @returns The block found, if any.
 */
function findBlock( block: EditorBlock, name: string ): EditorBlock | undefined {
	if ( block.name === name ) {
		return block;
	}

	for ( const innerBlock of block.innerBlocks ?? [] ) {
		const found = findBlock( innerBlock, name );

		if ( found ) {
			return found;
		}
	}

	return undefined;
}

function hasColumns( block: EditorBlock ): boolean {
	return ( block.innerBlocks ?? [] ).some( ( innerBlock ) => innerBlock.name === 'core/columns' );
}

function getQueryAttributes( block: EditorBlock ): QueryAttributes | undefined {
	const query = findBlock( block, 'core/query' );

	return query ? ( ( query.attributes.query ?? {} ) as QueryAttributes ) : undefined;
}

const getEditLinkSuggestion: BlockSuggestionBuilder = ( block ) => ( {
	id: 'edit-link',
	label: __( 'Edit link', __i18n_text_domain__ ),
	prompt: sprintf(
		/* translators: %s: the button's text */
		__( 'Change the %s button link to:', __i18n_text_domain__ ),
		String( block.attributes.text ?? '' )
	),
} );

const getAddColumnSuggestion: BlockSuggestionBuilder = ( block ) =>
	hasColumns( block )
		? {
				id: 'add-column',
				label: __( 'Add column', __i18n_text_domain__ ),
				prompt: __( 'Add another column to the end of these', __i18n_text_domain__ ),
			}
		: undefined;

const getSwapColumnsSuggestion: BlockSuggestionBuilder = ( block ) =>
	hasColumns( block )
		? {
				id: 'columns-within-group',
				label: __( 'Swap columns', __i18n_text_domain__ ),
				prompt: __( 'Reverse the order of these columns', __i18n_text_domain__ ),
			}
		: undefined;

const getNumberOfPostsSuggestion: BlockSuggestionBuilder = ( block ) => {
	const query = getQueryAttributes( block );

	if ( ! query ) {
		return undefined;
	}

	const perPage = query.perPage ?? DEFAULT_POSTS_PER_PAGE;
	const prompt = query.inherit
		? sprintf(
				/* translators: %d: the number of posts shown per page, e.g. 10 */
				__(
					'Stop inheriting default query settings and change the current number of posts displayed per page from %d to:',
					__i18n_text_domain__
				),
				perPage
			)
		: sprintf(
				/* translators: %d: the number of posts shown per page, e.g. 10 */
				_n(
					'Currently this query is displaying %d post per page, change it to:',
					'Currently this query is displaying %d posts per page, change it to:',
					perPage,
					__i18n_text_domain__
				),
				perPage
			);

	return {
		id: 'change-number-of-posts',
		label: __( 'Change number of posts', __i18n_text_domain__ ),
		prompt,
	};
};

const getOrderPostsSuggestion: BlockSuggestionBuilder = ( block ) => {
	const query = getQueryAttributes( block );

	if ( ! query ) {
		return undefined;
	}

	// Offer the reverse of the current order; queries default to newest first.
	const isNewestFirst = ( query.order ?? 'desc' ) === 'desc';
	let prompt: string;

	if ( query.inherit ) {
		prompt = isNewestFirst
			? __(
					'Stop inheriting default query settings and order posts from oldest to newest',
					__i18n_text_domain__
				)
			: __(
					'Stop inheriting default query settings and order posts from newest to oldest',
					__i18n_text_domain__
				);
	} else {
		prompt = isNewestFirst
			? __( 'By updating the query, order posts from oldest to newest', __i18n_text_domain__ )
			: __( 'By updating the query, order posts from newest to oldest', __i18n_text_domain__ );
	}

	return {
		id: 'order-posts',
		label: __( 'Order posts', __i18n_text_domain__ ),
		prompt,
	};
};

const TEXT_SUGGESTIONS: BlockSuggestionBuilder[] = [
	() => ( {
		id: 'translate',
		label: __( 'Translate content', __i18n_text_domain__ ),
		prompt: __( 'Translate this to:', __i18n_text_domain__ ),
	} ),
	() => ( {
		id: 'change-tone',
		label: __( 'Change tone', __i18n_text_domain__ ),
		prompt: __( 'Change the tone of this text to be more:', __i18n_text_domain__ ),
	} ),
	() => ( {
		id: 'check-grammar',
		label: __( 'Check grammar', __i18n_text_domain__ ),
		prompt: __( 'Check the grammar of this text', __i18n_text_domain__ ),
	} ),
];

const IMAGE_SUGGESTIONS: BlockSuggestionBuilder[] = [
	() => ( {
		id: 'generate-image',
		label: __( 'Generate image', __i18n_text_domain__ ),
		prompt: __( 'Generate an image of:', __i18n_text_domain__ ),
	} ),
	() => ( {
		id: 'edit-image',
		label: __( 'Edit image', __i18n_text_domain__ ),
		prompt: __( 'Edit the image to:', __i18n_text_domain__ ),
	} ),
	() => ( {
		id: 'remove-image-background',
		label: __( 'Remove background', __i18n_text_domain__ ),
		prompt: __( 'Remove the background from this image', __i18n_text_domain__ ),
	} ),
];

const BLOCK_SUGGESTIONS: Record< string, BlockSuggestionBuilder[] > = {
	'core/button': [ getEditLinkSuggestion ],
	'core/group': [
		getAddColumnSuggestion,
		getSwapColumnsSuggestion,
		getNumberOfPostsSuggestion,
		getOrderPostsSuggestion,
	],
	'core/query': [ getNumberOfPostsSuggestion, getOrderPostsSuggestion ],
	'core/paragraph': TEXT_SUGGESTIONS,
	'core/heading': TEXT_SUGGESTIONS,
	'core/image': IMAGE_SUGGESTIONS,
};

// The Jetpack AI sidebar has its own text and image actions, so where it loads
// these give way to it.
const JETPACK_AI_SIDEBAR_SUGGESTIONS = new Set( [ TEXT_SUGGESTIONS, IMAGE_SUGGESTIONS ] );

/**
 * The empty view's design actions. Call it once the theme has loaded: some
 * are Assembler-only.
 * @returns The suggestions.
 */
export function getEditorEmptyViewSuggestions(): Suggestion[] {
	const suggestions: Suggestion[] = [
		{
			id: 'customize-colors',
			label: __( 'Customize colors', __i18n_text_domain__ ),
			prompt: __( 'Show me color palettes for my site that are:', __i18n_text_domain__ ),
		},
		{
			id: 'change-page-layout',
			label: __( 'Change page layout', __i18n_text_domain__ ),
			prompt: __( 'Show me different layouts for this page', __i18n_text_domain__ ),
		},
		{
			id: 'choose-new-fonts',
			label: __( 'Choose new fonts', __i18n_text_domain__ ),
			prompt: __( 'Show me new fonts for my site', __i18n_text_domain__ ),
		},
		{
			id: 'edit-pages',
			label: __( 'Add new page', __i18n_text_domain__ ),
			prompt: __( 'Create a new page on my site for', __i18n_text_domain__ ),
		},
		{
			id: 'what-else-can-i-do',
			label: __( 'What else can you do?', __i18n_text_domain__ ),
			prompt: __(
				'Tell me all the ways you can help design or edit my site',
				__i18n_text_domain__
			),
		},
	];

	if ( isAssemblerTheme() ) {
		return suggestions;
	}

	return suggestions.filter(
		( suggestion ) => ! ASSEMBLER_ONLY_SUGGESTION_IDS.has( suggestion.id )
	);
}

/**
 * The actions for a block, in a fixed order.
 * @param block          - The selected block.
 * @param maxSuggestions - How many to return; all when omitted.
 * @returns The suggestions.
 */
export function getBlockSuggestions( block: EditorBlock, maxSuggestions?: number ): Suggestion[] {
	const builders = BLOCK_SUGGESTIONS[ block.name ] ?? [];

	if ( JETPACK_AI_SIDEBAR_SUGGESTIONS.has( builders ) && isJetpackAiSidebarEnabled() ) {
		return [];
	}

	const suggestions = builders
		.map( ( getSuggestion ) => getSuggestion( block ) )
		.filter( ( suggestion ): suggestion is Suggestion => !! suggestion );

	return suggestions.slice( 0, maxSuggestions );
}
