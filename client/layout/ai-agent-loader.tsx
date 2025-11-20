import { useShouldUseUnifiedAgent } from '@automattic/help-center';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type Props = {
	sectionName: string;
	currentRoute: string;
};

export default function AIAgentLoader( { sectionName, currentRoute }: Props ) {
	const shouldLoadUnifiedAgent = useShouldUseUnifiedAgent();
	const selectedSite = useSelector( getSelectedSite );
	const currentUser = useSelector( getCurrentUser );

	const handleClose = useCallback( () => {
		// Close handler - can be enhanced with state management later
	}, [] );

	if ( ! shouldLoadUnifiedAgent ) {
		return null;
	}

	return (
		<AsyncLoad
			require="@automattic/ai-manager"
			placeholder={ null }
			containerSelector="#wpcom"
			sectionName={ sectionName }
			currentRoute={ currentRoute }
			site={ selectedSite }
			currentUser={ currentUser }
			handleClose={ handleClose }
		/>
	);
}
