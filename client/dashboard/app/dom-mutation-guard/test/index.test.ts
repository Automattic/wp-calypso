/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-sentry', () => ( {
	captureMessage: jest.fn(),
} ) );

const trueInsertBefore = Node.prototype.insertBefore;
const trueRemoveChild = Node.prototype.removeChild;

// Google Translate wraps translated text nodes in <font> elements, so that's the
// most faithful way to reproduce the reparenting. The DOM lib types mark the
// <font> overload of createElement deprecated; widen the tag to string to route
// through the non-deprecated overload and avoid the deprecation hint.
const createFontElement = () => document.createElement( 'font' as string );

// The guard patches `Node.prototype` and keeps a module-level "reported once"
// flag, so each test starts from a clean module registry and clean prototype.
async function freshInstall() {
	jest.resetModules();
	Node.prototype.insertBefore = trueInsertBefore;
	Node.prototype.removeChild = trueRemoveChild;
	const { captureMessage } = await import( '@automattic/calypso-sentry' );
	const { installDomMutationGuard } = await import( '../index' );
	installDomMutationGuard();
	return jest.mocked( captureMessage );
}

afterEach( () => {
	Node.prototype.insertBefore = trueInsertBefore;
	Node.prototype.removeChild = trueRemoveChild;
	jest.clearAllMocks();
} );

describe( 'installDomMutationGuard', () => {
	test( 'inserts normally and does not report when the reference node is a child', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const reference = document.createElement( 'span' );
		parent.appendChild( reference );
		const newNode = document.createElement( 'em' );

		parent.insertBefore( newNode, reference );

		expect( newNode.parentNode ).toBe( parent );
		expect( newNode.nextSibling ).toBe( reference );
		expect( captureMessage ).not.toHaveBeenCalled();
	} );

	test( 'appends when the reference node is null (native behavior preserved)', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const existing = document.createElement( 'span' );
		parent.appendChild( existing );
		const newNode = document.createElement( 'em' );

		parent.insertBefore( newNode, null );

		expect( parent.lastChild ).toBe( newNode );
		expect( captureMessage ).not.toHaveBeenCalled();
	} );

	test( 'no-ops insertBefore when the reference node was reparented, instead of throwing', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const reference = document.createElement( 'span' );
		parent.appendChild( reference );
		// Simulate Google Translate wrapping the text node in a <font> element,
		// which reparents the node React still holds a reference to.
		createFontElement().appendChild( reference );
		const newNode = document.createElement( 'em' );

		let result: Node;
		expect( () => {
			result = parent.insertBefore( newNode, reference );
		} ).not.toThrow();

		expect( result! ).toBe( newNode );
		expect( newNode.parentNode ).toBeNull();
		expect( captureMessage ).toHaveBeenCalledTimes( 1 );
		expect( captureMessage ).toHaveBeenCalledWith( expect.any( String ), {
			level: 'warning',
			tags: { dom_mutation_guard: 'insertBefore' },
		} );
	} );

	test( 'removes normally and does not report when the child belongs to the parent', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const child = document.createElement( 'span' );
		parent.appendChild( child );

		parent.removeChild( child );

		expect( child.parentNode ).toBeNull();
		expect( parent.childNodes ).toHaveLength( 0 );
		expect( captureMessage ).not.toHaveBeenCalled();
	} );

	test( 'no-ops removeChild when the child is not a child of the parent, instead of throwing', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const stray = document.createElement( 'span' );

		let result: Node;
		expect( () => {
			result = parent.removeChild( stray );
		} ).not.toThrow();

		expect( result! ).toBe( stray );
		expect( captureMessage ).toHaveBeenCalledTimes( 1 );
		expect( captureMessage ).toHaveBeenCalledWith( expect.any( String ), {
			level: 'warning',
			tags: { dom_mutation_guard: 'removeChild' },
		} );
	} );

	test( 'reports at most once per session across multiple suppressed operations', async () => {
		const captureMessage = await freshInstall();

		const parent = document.createElement( 'div' );
		const reference = document.createElement( 'span' );
		parent.appendChild( reference );
		createFontElement().appendChild( reference );

		parent.insertBefore( document.createElement( 'em' ), reference );
		parent.removeChild( document.createElement( 'i' ) );

		expect( captureMessage ).toHaveBeenCalledTimes( 1 );
	} );
} );
