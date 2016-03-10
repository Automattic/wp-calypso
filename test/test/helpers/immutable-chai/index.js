import immutable from 'immutable';

export default function useImmutable( _chai ) {
	var Assertion = _chai.Assertion;

	Assertion.addMethod( 'immutablyEqual', function( other ) {
		this.assert(
			immutable.is( this._obj, other ),
			'Expected #{exp} to pass Immutable.is against #{act}',
			'Expected #{exp} not to pass Immutable.is against to #{act}',
			this._obj.toJS ? this._obj.toJS() : this._obj.toString(),
			other.toJS ? other.toJS() : other.toString(),
			true
		);
	} );
}
