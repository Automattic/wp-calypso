/**
 * @jest-environment node
 */

const path = require( 'path' );
const postcss = require( 'postcss' );
const sass = require( 'sass' );

describe( 'Resolved edit action CSS contract', () => {
	let css;

	beforeAll( () => {
		const stylesheet = path.resolve(
			__dirname,
			'../../../packages/agents-manager/src/components/agent-dock/style.scss'
		);
		css = postcss.parse(
			sass.compile( stylesheet, {
				loadPaths: [ path.resolve( __dirname, '../../../node_modules' ) ],
			} ).css
		);
	} );

	const getDeclarations = ( selector ) => {
		const matchingRules = [];

		css.walkRules( ( rule ) => {
			if ( rule.selectors.length === 1 && rule.selectors[ 0 ].endsWith( selector ) ) {
				matchingRules.push( rule );
			}
		} );

		if ( matchingRules.length !== 1 ) {
			throw new Error(
				`Expected exactly one CSS rule ending with ${ selector }, found ${ matchingRules.length }`
			);
		}

		const declarations = new Map();
		matchingRules[ 0 ].walkDecls( ( declaration ) => {
			declarations.set( declaration.prop, declaration.value );
		} );

		return declarations;
	};

	it( 'keeps icon paths on the surrounding action color', () => {
		const declarations = getDeclarations( '.agents-manager-resolved-edit-action__icon path' );

		expect( declarations.get( 'color' ) ).toBe( 'inherit' );
		expect( declarations.get( 'fill' ) ).toBe( 'currentColor' );
	} );

	it( 'uses circular status icons and distinct active and disabled actions', () => {
		const status = getDeclarations( '.agents-manager-resolved-edit-action__status' );
		const statusIcon = getDeclarations(
			'.agents-manager-resolved-edit-action__status .agents-manager-resolved-edit-action__icon'
		);
		const confirmedIcon = getDeclarations(
			'.agents-manager-resolved-edit-action__status:not(.agents-manager-resolved-edit-action__status--reverted) .agents-manager-resolved-edit-action__icon'
		);
		const revertedIcon = getDeclarations(
			'.agents-manager-resolved-edit-action__status--reverted .agents-manager-resolved-edit-action__icon'
		);
		const action = getDeclarations( '.agents-manager-resolved-edit-action__undo' );
		const disabledAction = getDeclarations( '.agents-manager-resolved-edit-action__undo:disabled' );

		expect( status.get( 'color' ) ).toBe( 'var(--color-foreground)' );
		expect( status.get( 'gap' ) ).toBe( '0.5rem' );
		expect( status.get( 'padding-inline-start' ) ).toBe( '0' );
		expect( statusIcon.get( 'width' ) ).toBe( '22px' );
		expect( statusIcon.get( 'height' ) ).toBe( '22px' );
		expect( statusIcon.get( 'border-radius' ) ).toBe( '50%' );
		expect( statusIcon.get( 'color' ) ).toBe( 'var(--color-white, #fff)' );
		expect( confirmedIcon.get( 'background-color' ) ).toBe( '#3858e8' );
		expect( revertedIcon.get( 'background-color' ) ).toBe( '#5e5e5e' );
		expect( revertedIcon.get( 'padding' ) ).toBe( '3.5px' );
		expect( action.get( 'color' ) ).toBe( 'var(--color-foreground)' );
		expect( disabledAction.get( 'color' ) ).toBe( 'var(--color-muted-foreground)' );
		expect( disabledAction.get( 'opacity' ) ).toBe( '0.66' );
	} );
} );
