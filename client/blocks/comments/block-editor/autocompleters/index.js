/**
 * Internal dependencies
 */
import makeUserCompleter from './user';
import xPostCompleter from './xpost';

import './style.scss';

export default function addAutocompleters( userSuggestions ) {
	return ( completers = [] ) => {
		completers.push( xPostCompleter );
		// Override the standard user completer with a custom one
		const userCompleterPos = completers.findIndex( ( item ) => item.name === 'users' );

		if ( userCompleterPos !== -1 ) {
			completers[ userCompleterPos ] = makeUserCompleter( userSuggestions );
		}

		return completers;
	};
}
