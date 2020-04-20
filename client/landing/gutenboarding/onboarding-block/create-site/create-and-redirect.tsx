/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { Step, usePath } from '../../path';

const CreateAndRedirect = () => {
	const { siteTitle, siteVertical } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const makePath = usePath();
	const { createSite } = useDispatch( ONBOARD_STORE );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	useEffect( () => {
		// If there's no site title don't wait for a free domain suggestion, there won't be one
		if ( currentUser && ( ! siteTitle || freeDomainSuggestion ) ) {
			createSite( currentUser.username, freeDomainSuggestion );
		}
	}, [ createSite, currentUser, freeDomainSuggestion, siteTitle ] );

	if ( ! siteVertical ) {
		return <Redirect to={ makePath( Step.IntentGathering ) } />;
	}

	return null;
};

export default CreateAndRedirect;
