import { __ } from '@wordpress/i18n';
import { Button, EmptyState, Stack } from '@wordpress/ui';
import { useEffect, useState } from 'react';

type LoadErrorProps = {
	isRetrying: boolean;
	onRetry: () => void;
};

/**
 * Says the tab's notifications couldn't load, with a button that loads them again.
 */
export default function LoadError( { isRetrying, onRetry }: LoadErrorProps ) {
	// A status region that already holds its text when it mounts may not be
	// announced, and the error is usually set before the list opens, so fill it
	// one render later.
	const [ isMounted, setIsMounted ] = useState( false );
	useEffect( () => setIsMounted( true ), [] );

	return (
		<div className="wpnc__load-error">
			<EmptyState.Root>
				<Stack role="status" direction="column" gap="sm" align="center">
					{ isMounted && (
						<>
							<EmptyState.Title>{ __( 'Notifications unavailable' ) }</EmptyState.Title>
							<EmptyState.Description className="wpnc__load-error-description">
								{ __( 'Something went wrong while loading them.' ) }
							</EmptyState.Description>
						</>
					) }
				</Stack>
				<EmptyState.Actions>
					<Button variant="outline" loading={ isRetrying } onClick={ onRetry }>
						{ __( 'Try again' ) }
					</Button>
				</EmptyState.Actions>
			</EmptyState.Root>
		</div>
	);
}
