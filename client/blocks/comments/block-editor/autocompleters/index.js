/**
 * Internal dependencies
 */
import makeUserCompleter from './user';

export default function addAutocompleters( userSuggestions ) {
	return ( completers = [] ) => {
		// Override the standard user completer with a custom one
		const userCompleterPos = completers.findIndex( ( item ) => item.name === 'users' );

		if ( userCompleterPos !== -1 ) {
			completers[ userCompleterPos ] = makeUserCompleter( userSuggestions );
		}

		return completers;
	};
}
