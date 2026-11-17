// translators: two lines above (should be ignored)

const a = __( 'two above' );
// translators: one above
const b = __( 'one above' );
const c = __( 'same line' ); // translators: trailing same line
/* translators: block
   spanning lines */
const d = __( 'after block' );
const e = (
	// translators: inside parens
	__( 'in parens' )
);
const f = (
	<div>
		{ /* translators: jsx empty */ }
		<span>{ __( 'jsx child' ) }</span>
		{ /* translators: jsx before expr */ __( 'jsx expr' ) }
	</div>
);
// translators: parent chain
const g = foo(
	__( 'nested next line' )
);
// translators: first
// translators: second
const h = __( 'two comments' );
const i = __( 'dup' );
// translators: dup comment
const j = __( 'dup' );
function z() {
	// translators: in function
	return __( 'returned' );
}
const obj = {
	// translators: object property
	key: __( 'prop value' ),
	other: __( 'no comment' ), // translators: trailing prop
};
