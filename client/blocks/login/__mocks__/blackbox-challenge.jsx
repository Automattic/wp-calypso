import { useEffect, useState } from 'react';

// Stand-in widget that reports its blocking state to the host form. Set `blocked`
// before rendering, or call `setBlocked` to raise a challenge mid-submit. `enabled` holds what
// the last render was given.
export default function MockBlackboxChallenge( { enabled, onSubmitBlockedChange } ) {
	const [ blocked, setBlocked ] = useState( MockBlackboxChallenge.blocked );
	MockBlackboxChallenge.setBlocked = setBlocked;
	MockBlackboxChallenge.enabled = enabled;
	useEffect( () => onSubmitBlockedChange?.( blocked ), [ blocked, onSubmitBlockedChange ] );
	return null;
}

MockBlackboxChallenge.blocked = false;
