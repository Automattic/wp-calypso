import { Button, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';

export default function ResourceWebpagePreview( { url, title }: { url: string; title: string } ) {
	const [ mounted, setMounted ] = useState( false );
	const [ attempt, setAttempt ] = useState( 0 );
	const [ loaded, setLoaded ] = useState( false );
	const [ slow, setSlow ] = useState( false );

	// Start navigation after the modal's portal has been attached to the document.
	useEffect( () => setMounted( true ), [] );
	useEffect( () => {
		if ( loaded ) {
			return;
		}
		const timeout = window.setTimeout( () => setSlow( true ), 8000 );
		return () => window.clearTimeout( timeout );
	}, [ attempt, loaded ] );

	return (
		<div className="resource-webpage-preview">
			{ mounted && (
				<iframe
					key={ attempt }
					src={ url }
					title={ title }
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
					referrerPolicy="no-referrer"
					onLoad={ ( event ) => {
						// A newly attached iframe can report its initial empty document first.
						if ( event.currentTarget.contentDocument?.URL === 'about:blank' ) {
							return;
						}
						setLoaded( true );
					} }
				/>
			) }
			{ ! loaded && (
				<div className="resource-webpage-preview-status">
					<Spinner />
					<span role="status">
						{ slow
							? __( 'Preview taking too long? Try again or open the resource in a new tab.' )
							: __( 'Loading preview…' ) }
					</span>
					{ slow && (
						<Button
							variant="secondary"
							size="compact"
							onClick={ () => {
								setSlow( false );
								setAttempt( ( current ) => current + 1 );
							} }
						>
							{ __( 'Retry preview' ) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
}
