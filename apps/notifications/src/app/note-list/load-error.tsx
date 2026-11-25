import { __experimentalSpacer as Spacer } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import { useEffect, useState } from 'react';

type LoadErrorProps = {
	isRetrying: boolean;
	onRetry: () => void;
};

/**
 * Says the tab's notifications couldn't load, with a button that loads them again.
 */
export default function LoadError( { isRetrying, onRetry }: LoadErrorProps ) {
	// Notice.List announces only notices added after it mounts, and the error is
	// usually set before the list opens, so add it one render later.
	const [ isListMounted, setIsListMounted ] = useState( false );
	useEffect( () => setIsListMounted( true ), [] );

	return (
		<Spacer margin={ 4 }>
			<Notice.List>
				{ isListMounted && (
					<Notice.Root intent="error">
						<Notice.Description>{ __( 'Couldn’t load your notifications.' ) }</Notice.Description>
						<Notice.Actions>
							<Notice.ActionButton variant="minimal" loading={ isRetrying } onClick={ onRetry }>
								{ __( 'Try again' ) }
							</Notice.ActionButton>
						</Notice.Actions>
					</Notice.Root>
				) }
			</Notice.List>
		</Spacer>
	);
}
