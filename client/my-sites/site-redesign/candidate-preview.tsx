import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { fetchPreview, type Candidate } from './api';
import { SiteSkeleton } from './site-skeleton';

export type PreviewState = 'loading' | 'ready' | 'error';

export function messageOf( error: unknown ): string {
	const message = ( error as { message?: unknown } | null )?.message;
	return typeof message === 'string' && message
		? message
		: __( 'Something went wrong. Please try again.' );
}

export function CandidatePreview( {
	siteId,
	redesignId,
	candidate,
	index,
	isActive,
	onStateChange,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
	isActive: boolean;
	/** Reports whether the preview is actually on screen, which is what a choice is made from. */
	onStateChange: ( generationId: string, state: PreviewState ) => void;
} ) {
	const preview = useQuery( {
		queryKey: [ 'site-redesign-preview', siteId, redesignId, candidate.id ],
		queryFn: () => fetchPreview( siteId, redesignId, candidate.id ),
		staleTime: Infinity,
	} );
	const [ loaded, setLoaded ] = useState( false );

	let state: PreviewState = loaded ? 'ready' : 'loading';
	if ( preview.isError ) {
		state = 'error';
	}
	useEffect( () => {
		onStateChange( candidate.id, state );
	}, [ candidate.id, state, onStateChange ] );

	if ( preview.isError ) {
		return (
			<div className="site-redesign__slide-message">
				<p>{ messageOf( preview.error ) }</p>
				<Button
					__next40pxDefaultSize
					variant="secondary"
					tabIndex={ isActive ? undefined : -1 }
					isBusy={ preview.isFetching }
					disabled={ preview.isFetching }
					onClick={ () => preview.refetch() }
				>
					{ __( 'Try again' ) }
				</Button>
			</div>
		);
	}
	return (
		<>
			{ ! loaded && <SiteSkeleton className="site-redesign__skeleton" /> }
			{ preview.data && (
				<iframe
					className={ clsx( 'site-redesign__frame', { 'is-loaded': loaded } ) }
					title={ sprintf(
						/* translators: %d is the design's position in the list of designs. */
						__( 'Preview of design %d' ),
						index + 1
					) }
					// Opaque origin: the server's own script may run, nothing in it can reach Calypso.
					sandbox="allow-scripts"
					srcDoc={ preview.data.html }
					tabIndex={ -1 }
					onLoad={ () => setLoaded( true ) }
				/>
			) }
		</>
	);
}
