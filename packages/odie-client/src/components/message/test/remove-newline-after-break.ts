import { removeNewlineAfterBreak } from '../remove-newline-after-break';

type Node = { type: string; tagName?: string; value?: string; children?: Node[] };

const text = ( value: string ): Node => ( { type: 'text', value } );
const br = (): Node => ( { type: 'element', tagName: 'br', children: [] } );
const element = ( tagName: string, children: Node[] ): Node => ( {
	type: 'element',
	tagName,
	children,
} );
const root = ( children: Node[] ): Node => ( { type: 'root', children } );

describe( 'removeNewlineAfterBreak', () => {
	it( 'removes the newline that follows a hard break', () => {
		// What react-markdown produces for "line one  \nline two".
		const tree = root( [ element( 'p', [ text( 'line one' ), br(), text( '\nline two' ) ] ) ] );

		removeNewlineAfterBreak()( tree );

		expect( tree ).toEqual(
			root( [ element( 'p', [ text( 'line one' ), br(), text( 'line two' ) ] ) ] )
		);
	} );

	it( 'removes the newline after a hard break inside nested elements', () => {
		// "*line one  \nline two*"
		const tree = root( [
			element( 'p', [ element( 'em', [ text( 'line one' ), br(), text( '\nline two' ) ] ) ] ),
		] );

		removeNewlineAfterBreak()( tree );

		expect( tree ).toEqual(
			root( [
				element( 'p', [ element( 'em', [ text( 'line one' ), br(), text( 'line two' ) ] ) ] ),
			] )
		);
	} );

	it( 'keeps soft line breaks', () => {
		const tree = root( [ element( 'p', [ text( 'line one\nline two' ) ] ) ] );

		removeNewlineAfterBreak()( tree );

		expect( tree ).toEqual( root( [ element( 'p', [ text( 'line one\nline two' ) ] ) ] ) );
	} );
} );
