import { Button, Spinner } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BlueprintLoadError } from '../../lib/blueprint-load-error';
import { PlaygroundNotFoundError } from '../../lib/playground-not-found-error';
import './style.scss';

function PlaygroundNotFound( { createNewPlayground }: { createNewPlayground: () => void } ) {
	const [ searchParams ] = useSearchParams();
	const playgroundId = searchParams.get( 'playground' );
	const [ countdown, setCountdown ] = useState( 5 );

	const errorMessage = sprintf(
		// translators: %s is the playground ID from the URL
		__(
			'The playground you are trying to access (ID: %s) does not exist or is no longer available in this browser.'
		),
		playgroundId ?? ''
	);

	useEffect( () => {
		if ( countdown === 0 ) {
			createNewPlayground();
			return;
		}
		const timer = setTimeout( () => setCountdown( countdown - 1 ), 1000 );
		return () => clearTimeout( timer );
	}, [ countdown, createNewPlayground ] );

	return (
		<>
			<h2 className="playground-error__title">{ __( 'Playground Not Found' ) }</h2>
			<p className="playground-error__message">{ errorMessage }</p>
			<div className="playground-error__loader">
				<Spinner />
				<p>
					{ sprintf(
						// translators: %d is the number of seconds remaining
						_n(
							'Creating new playground in %d second\u2026',
							'Creating new playground in %d seconds\u2026',
							countdown
						),
						countdown
					) }
				</p>
			</div>
		</>
	);
}

function BlueprintNotFound( {
	error,
	createNewPlayground,
}: {
	error: BlueprintLoadError;
	createNewPlayground: () => void;
} ) {
	return (
		<>
			<h2 className="playground-error__title">{ __( 'Blueprint Not Found' ) }</h2>
			<p className="playground-error__message">
				{ sprintf(
					// translators: %s is the URL of the blueprint that could not be loaded
					__( 'The blueprint at %s could not be loaded. Check the link, or start without it.' ),
					error.url
				) }
			</p>
			<Button
				className="playground-error__button"
				variant="primary"
				onClick={ createNewPlayground }
			>
				{ __( 'Start a new playground' ) }
			</Button>
		</>
	);
}

function UnknownError( { retry }: { retry: () => void } ) {
	return (
		<>
			<h2 className="playground-error__title">{ __( 'Something went wrong' ) }</h2>
			<p className="playground-error__message">
				{ __( 'The playground could not be started. Please try again.' ) }
			</p>
			<Button className="playground-error__button" variant="primary" onClick={ retry }>
				{ __( 'Try again' ) }
			</Button>
		</>
	);
}

export function PlaygroundError( {
	error,
	createNewPlayground,
	retry,
}: {
	error: Error;
	createNewPlayground: () => void;
	retry: () => void;
} ) {
	let content;
	if ( error instanceof PlaygroundNotFoundError ) {
		content = <PlaygroundNotFound createNewPlayground={ createNewPlayground } />;
	} else if ( error instanceof BlueprintLoadError ) {
		content = <BlueprintNotFound error={ error } createNewPlayground={ createNewPlayground } />;
	} else {
		content = <UnknownError retry={ retry } />;
	}

	return (
		<div className="playground-error">
			<div className="playground-error__content">{ content }</div>
		</div>
	);
}
