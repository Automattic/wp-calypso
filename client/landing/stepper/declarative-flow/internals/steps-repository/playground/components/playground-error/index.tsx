import { Spinner } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './style.scss';

export function PlaygroundError( { createNewPlayground }: { createNewPlayground: () => void } ) {
	const [ searchParams ] = useSearchParams();
	const playgroundId = searchParams.get( 'playground' );
	const [ countdown, setCountdown ] = useState( 5 );

	const errorMessage = sprintf(
		// translators: %s is the playground ID from the URL
		__(
			'The playground you are trying to access (ID: %s) does not exist or is no longer available in this browser.'
		),
		playgroundId
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
		<div className="playground-error">
			<div className="playground-error__content">
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
			</div>
		</div>
	);
}
