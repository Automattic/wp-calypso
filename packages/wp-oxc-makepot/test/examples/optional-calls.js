import { translate as tr } from 'i18n-calypso';
const a = obj?.translate( 'optional member' );
const b = translate?.( 'optional call' );
const c = obj?.i18n.__( 'deep optional' );
const d = obj.i18n?.__( 'later optional' );
const e = tr( 'aliased call' );
const f = i18n[ 'translate' ]( 'computed member' );
class K {
	#translate( s ) {
		return s;
	}
	m() {
		return this.#translate( 'private name' );
	}
}
const g = __( 'a' - 'b' );
const h = __( `tpl ${ x } after` );
const i = translate( 'Count', 'Counts', { count: n, context: 'ctx opt', comment: 'opt comment' } );
const j = translate( 'With ctx', { context: `template ctx` } );
const k = translate( 'Methods', { context() { return 'x'; }, ...rest, 'comment': 'string key' } );
const l = __( 42 );
const m = _nx( 'One', 'Many', n, 'ctx nx' );
const o = __( 'concat ' + "double" + `tpl` );
