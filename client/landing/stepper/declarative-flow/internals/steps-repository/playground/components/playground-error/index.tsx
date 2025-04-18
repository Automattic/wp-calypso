import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useSearchParams } from 'react-router-dom';
import './style.scss';

export function PlaygroundError( { createNewPlayground }: { createNewPlayground: () => void } ) {
	const [ searchParams ] = useSearchParams();
	const playgroundId = searchParams.get( 'playground' );

	const errorMessage = sprintf(
		// translators: %s is the playground ID from the URL
		__(
			'The playground you are trying to access (ID: %s) does not exist or is no longer available in this browser.'
		),
		playgroundId
	);

	return (
		<div className="playground-error">
			<div className="playground-error__content">
				<h2 className="playground-error__title">{ __( 'Playground Not Found' ) }</h2>
				<p className="playground-error__message">{ errorMessage }</p>
				<Button
					variant="primary"
					onClick={ createNewPlayground }
					className="playground-error__button"
				>
					{ __( 'Create New Playground' ) }
				</Button>
			</div>
		</div>
	);
}
