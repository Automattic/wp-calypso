import { isWpError } from '@automattic/api-core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bumpStat } from '../analytics';

function getMutationKeyLabel( key: unknown ): string {
	if ( ! Array.isArray( key ) ) {
		return 'unknown';
	}
	const leading: string[] = [];
	for ( const part of key ) {
		if ( typeof part !== 'string' ) {
			break;
		}
		leading.push( part );
	}
	return leading.length ? leading.join( ':' ) : 'unknown';
}

export default function MutationErrorTracker() {
	const queryClient = useQueryClient();

	useEffect( () => {
		return queryClient.getMutationCache().subscribe( ( event ) => {
			if ( event.type !== 'updated' || event.action.type !== 'error' ) {
				return;
			}

			const { mutation } = event;
			const error = event.action.error;

			const keyLabel = getMutationKeyLabel( mutation.options.mutationKey );
			const name = isWpError( error ) ? `${ keyLabel }:${ error.status }` : keyLabel;

			bumpStat( 'hd-mutation-error', name );
		} );
	}, [ queryClient ] );

	return null;
}
