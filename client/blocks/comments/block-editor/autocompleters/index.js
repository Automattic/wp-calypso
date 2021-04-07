/**
 * Internal dependencies
 */
import makeUserCompleter from './user';
import makeXPostCompleter from './xpost';

import './style.scss';

export default async function addAutocompleters( userSuggestions ) {
	const xpostCompleter = await makeXPostCompleter();
	return ( completers = [] ) => {
		completers.push( xpostCompleter );
		// Override the standard user completer with a custom one
		const userCompleterPos = completers.findIndex( ( item ) => item.name === 'users' );

		if ( userCompleterPos !== -1 ) {
			completers[ userCompleterPos ] = makeUserCompleter( userSuggestions );
		}

		return completers;
	};
}
