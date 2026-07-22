/**
 * @jest-environment node
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

const COMPONENTS = [
	{
		name: 'AI Editorial Review',
		root: '.jetpack-ai-editorial-review',
		stylesheet: 'ai-editorial-review.scss',
		footer: '.jetpack-ai-editorial-review__footer',
	},
	{
		name: 'Feedback List',
		root: '.jetpack-ai-feedback-list',
		stylesheet: 'feedback-list.scss',
		footer: '.jetpack-ai-feedback-list__footer',
	},
];

function compileStylesheet( stylesheet ) {
	const file = path.resolve(
		__dirname,
		'../../../packages/jetpack-ai-sidebar/src/components',
		stylesheet
	);
	return postcss.parse( sass.compile( file ).css );
}

function getDeclarations( css, selector ) {
	const declarations = new Map();
	let selectorFound = false;

	css.walkRules( ( rule ) => {
		if ( rule.selectors.includes( selector ) ) {
			selectorFound = true;
			rule.walkDecls( ( declaration ) => {
				declarations.set( declaration.prop, declaration.value );
			} );
		}
	} );

	expect( selectorFound ).toBe( true );
	return declarations;
}

describe( 'getDeclarations', () => {
	it( 'combines repeated selector declarations in source order', () => {
		const css = postcss.parse( `
			.repeated-selector { color: red; display: block; }
			.repeated-selector { color: blue; }
		` );

		const declarations = getDeclarations( css, '.repeated-selector' );

		expect( declarations.get( 'display' ) ).toBe( 'block' );
		expect( declarations.get( 'color' ) ).toBe( 'blue' );
	} );
} );

describe.each( COMPONENTS )( '$name layout CSS contract', ( component ) => {
	const css = compileStylesheet( component.stylesheet );

	it( 'cancels the Agenttic message gutter at the component root', () => {
		const declarations = getDeclarations( css, component.root );
		expect( declarations.get( 'margin-inline' ).replaceAll( ' ', '' ) ).toBe(
			'calc(-1*var(--spacing-4))'
		);
	} );

	it( 'cancels Gutenberg inline panel and title offsets without changing block spacing', () => {
		const panelDeclarations = getDeclarations(
			css,
			`${ component.root } .components-panel__body.is-opened`
		);
		const titleDeclarations = getDeclarations(
			css,
			`${ component.root } .components-panel__body.is-opened > .components-panel__body-title`
		);

		expect( panelDeclarations.get( 'padding-inline' ) ).toBe( '0' );
		expect( panelDeclarations.has( 'padding-block' ) ).toBe( false );
		expect( titleDeclarations.get( 'margin-inline' ) ).toBe( '0' );
		expect( titleDeclarations.has( 'margin-block' ) ).toBe( false );
	} );

	it( 'does not re-inset the boxed footer', () => {
		const declarations = getDeclarations( css, component.footer );
		expect( declarations.has( 'padding-inline' ) ).toBe( false );
	} );
} );

describe( 'Feedback List card CSS contract', () => {
	const css = compileStylesheet( 'feedback-list.scss' );

	it( 'uses the shared inline gutter for card content and actions', () => {
		const diffRow = getDeclarations( css, '.jetpack-ai-feedback-list__diff-row' );
		const actions = getDeclarations( css, '.jetpack-ai-feedback-list__actions' );

		expect( diffRow.get( 'padding' ) ).toBe( '0.625rem var(--spacing-4)' );
		expect( actions.get( 'padding' ) ).toBe( '0.75rem var(--spacing-4)' );
	} );
} );

describe( 'AI Editorial Review conflict-card CSS contract', () => {
	const css = compileStylesheet( 'ai-editorial-review.scss' );

	it( 'uses the shared card inline gutter without changing its block spacing', () => {
		const declarations = getDeclarations(
			css,
			'.jetpack-ai-editorial-review .jetpack-ai-editorial-review__conflict-card:not(.is-collapsed)'
		);

		expect( declarations.get( 'padding-inline' ) ).toBe( 'var(--spacing-4)' );
		expect( declarations.get( 'padding-block' ) ).toBe( '1.25rem' );
	} );

	it( 'keeps the shared action row flush and maps the conflict primary treatment', () => {
		const conflictActions = getDeclarations(
			css,
			'.jetpack-ai-editorial-review__conflict-resolution .jetpack-ai-feedback-list__actions'
		);

		expect( conflictActions.get( 'padding' ) ).toBe( '0' );
		expect( conflictActions.get( '--jetpack-ai-feedback-list-primary' ) ).toBe(
			'var(--jetpack-ai-review-primary)'
		);
		expect( conflictActions.get( '--jetpack-ai-feedback-list-primary-foreground' ) ).toBe(
			'var(--jetpack-ai-review-primary-foreground)'
		);
	} );
} );
