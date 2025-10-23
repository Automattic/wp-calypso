/* global helpCenterData */
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';

/**
 * Populate the help center store with the appropriate information on page load.
 */
export const useSetupHelpCenterStore = () => {
	const { setOdieBotNameSlug } = useDispatch( 'automattic/help-center' );

	useEffect( () => {
		if ( helpCenterData.isCommerceGarden ) {
			setOdieBotNameSlug( 'ciab-workflow-support_chat' );
		}
	}, [ setOdieBotNameSlug ] );
};
