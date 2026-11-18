import { getThemeFeaturedImageAspectRatio, normalizeThemeAspectRatio } from './theme-aspect-ratio';

const SINGLE_TEMPLATE = `<!-- wp:template-part {"slug":"header","theme":"assembler"} /-->
<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group"><!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:post-title /-->
<!-- wp:post-featured-image {"aspectRatio":"4/3","align":"wide"} /-->
<!-- wp:post-content /--></div>
<!-- /wp:group --></main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","theme":"assembler"} /-->`;

const TEMPLATE_WITH_QUERY_LOOP = `<!-- wp:query {"queryId":1} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->
<!-- /wp:post-template --></div>
<!-- /wp:query -->
<!-- wp:post-featured-image {"aspectRatio":"16/9"} /-->`;

function makeSelect(
	options: {
		templateId?: string | null | undefined;
		record?: unknown;
		editorStore?: boolean;
	} = {}
) {
	const templateId = 'templateId' in options ? options.templateId : 'assembler//single';
	const record = 'record' in options ? options.record : { content: SINGLE_TEMPLATE };
	const editorStore = options.editorStore ?? true;
	return ( storeName: string ) => {
		if ( storeName === 'core/editor' ) {
			return editorStore ? { getCurrentTemplateId: () => templateId } : null;
		}
		if ( storeName === 'core' ) {
			return {
				getEditedEntityRecord: ( kind: string, name: string, id: string ) =>
					kind === 'postType' && name === 'wp_template' && id === templateId ? record : undefined,
			};
		}
		return null;
	};
}

describe( 'normalizeThemeAspectRatio', () => {
	it.each( [
		[ '4/3', '4:3' ],
		[ '16/9', '16:9' ],
		[ '16:9', '16:9' ],
		[ ' 4 / 3 ', '4:3' ],
		[ '8/6', '4:3' ],
		[ '3/2', '3:2' ],
		[ '3:2', '3:2' ],
		[ '6/4', '3:2' ],
	] )( 'maps %s to the picker value %s', ( input, expected ) => {
		expect( normalizeThemeAspectRatio( input ) ).toBe( expected );
	} );

	it.each( [
		[ '1/1', 'square' ],
		[ '21/9', 'landscape ratio the picker lacks' ],
		[ '2/3', 'portrait, picker only' ],
		[ '3/4', 'portrait' ],
		[ '9/16', 'portrait' ],
		[ 'auto', 'natural image shape' ],
		[ '', 'empty' ],
		[ undefined, 'missing' ],
		[ null, 'null' ],
		[ '4/0', 'zero height' ],
		[ '0/3', 'zero width' ],
		[ '1.33', 'decimal' ],
		[ 4 / 3, 'number' ],
	] )( 'returns null for %s (%s)', ( input ) => {
		expect( normalizeThemeAspectRatio( input ) ).toBeNull();
	} );
} );

describe( 'getThemeFeaturedImageAspectRatio', () => {
	it( 'reads the featured image ratio nested in the single post template', () => {
		expect( getThemeFeaturedImageAspectRatio( makeSelect() ) ).toBe( '4:3' );
	} );

	it( 'ignores featured images inside a query loop', () => {
		const select = makeSelect( { record: { content: TEMPLATE_WITH_QUERY_LOOP } } );
		expect( getThemeFeaturedImageAspectRatio( select ) ).toBe( '16:9' );
	} );

	it.each( [
		[
			'as siblings',
			'<!-- wp:post-featured-image /--><!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->',
		],
		[
			'across nesting levels',
			'<!-- wp:group --><div><!-- wp:post-featured-image /--></div><!-- /wp:group --><!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->',
		],
		[
			'inside the same group',
			'<!-- wp:group --><div><!-- wp:post-featured-image /--><!-- wp:post-featured-image {"aspectRatio":"4/3"} /--></div><!-- /wp:group -->',
		],
	] )( 'uses the first featured image that sets a ratio %s', ( _label, content ) => {
		expect( getThemeFeaturedImageAspectRatio( makeSelect( { record: { content } } ) ) ).toBe(
			'4:3'
		);
	} );

	it( 'reads unsaved template edits from the blocks array', () => {
		const select = makeSelect( {
			record: {
				content: () => '',
				blocks: [
					{
						name: 'core/group',
						attributes: {},
						innerBlocks: [
							{ name: 'core/post-featured-image', attributes: { aspectRatio: '4/3' } },
						],
					},
				],
			},
		} );
		expect( getThemeFeaturedImageAspectRatio( select ) ).toBe( '4:3' );
	} );

	it.each( [
		[ 'the editor store is missing', makeSelect( { editorStore: false } ) ],
		[ 'no template is resolved yet', makeSelect( { templateId: undefined } ) ],
		[ 'the theme has no template', makeSelect( { templateId: '' } ) ],
		[ 'the template record is not loaded', makeSelect( { record: undefined } ) ],
		[ 'core-data reports the record as missing', makeSelect( { record: false } ) ],
		[ 'the template content is not a string', makeSelect( { record: { content: 42 } } ) ],
		[
			'the template has no featured image',
			makeSelect( { record: { content: '<!-- wp:post-title /-->' } } ),
		],
		[
			'the featured image keeps its natural shape',
			makeSelect( { record: { content: '<!-- wp:post-featured-image /-->' } } ),
		],
		[
			'a selector throws',
			() => {
				throw new Error( 'boom' );
			},
		],
	] )( 'returns null when %s', ( _label, select ) => {
		expect( getThemeFeaturedImageAspectRatio( select ) ).toBeNull();
	} );
} );
