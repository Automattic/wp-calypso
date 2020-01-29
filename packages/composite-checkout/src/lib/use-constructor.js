/**
 * External dependencies
 */
import { useRef } from 'react';

export default function useConstructor( callback ) {
	const didRun = useRef( false );
	if ( didRun.current === true ) {
		return;
	}
	didRun.current = true;
	callback();
}
