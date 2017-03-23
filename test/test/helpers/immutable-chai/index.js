import immutable from 'immutable';

export default function useImmutable(_chai) {
    _chai.Assertion.addMethod('immutablyEqual', function(other) {
        this.assert(
            immutable.is(other, this._obj),
            'Expected these objects to be equivalent using Immutable.is()',
            'Expected these objects to not be equivalent using Immutable.is()',
            this._obj.toJS ? this._obj.toJS() : this._obj.toString(),
            other.toJS ? other.toJS() : other.toString(),
            true
        );
    });
}
