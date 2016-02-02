

export function isOffline( state ) {
	return ( state.application.connectionState === 'OFFLINE' )
}

export function isOnline( state ) {
	return ( state.application.connectionState === 'ONLINE' )
}

export function getCommandLineNewPostData( state ) {
    let { title, content, argumentsUsed } = state.application.commandLineArguments;
    if ( argumentsUsed ) {
        return {};
    }
    return { title, content }
}
