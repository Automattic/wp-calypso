/**
 * A function that only sets the new state if it's different from the current state
 *
 * @param {object} newState The new state to set
 * @returns {boolean} True if new values found, false if not
 */

export default function smartSetState( newState ) {
	const hasNewValues = Object.keys( newState ).some( function ( key ) {
		return (
			! ( this.state && this.state.hasOwnProperty( key ) ) || this.state[ key ] !== newState[ key ]
		);
	}, this );
	if ( hasNewValues ) {
		this.setState( newState );
		return true;
	}
	return false;
}
