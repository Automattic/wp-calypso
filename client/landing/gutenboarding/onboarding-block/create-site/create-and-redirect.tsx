/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { useFreeDomainSuggestion } from '../../hooks/use-free-domain-suggestion';
import { Step, usePath } from '../../path';

type Status = 'INIT' | 'SUCCESS' | 'ERROR' | 'MISSING_SITE_DATA';

const CreateAndRedirect = () => {
	const { siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );
	const [ status, setStatus ] = useState< Status >( siteVertical ? 'INIT' : 'MISSING_SITE_DATA' );

	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const makePath = usePath();
	const { createSite } = useDispatch( ONBOARD_STORE );

	const freeDomainSuggestion = useFreeDomainSuggestion();

	useEffect( () => {
		if ( currentUser && freeDomainSuggestion ) {
			createSite( currentUser.username, freeDomainSuggestion ).then( success => {
				setStatus( success ? 'SUCCESS' : 'ERROR' );
			} );
		}
	}, [ createSite, currentUser, freeDomainSuggestion, setStatus ] );

	switch ( status ) {
		case 'INIT':
			return null;

		case 'SUCCESS':
			return <Redirect to={ makePath( Step.CreateSite ) } />;

		case 'ERROR':
		case 'MISSING_SITE_DATA':
			return <Redirect to={ makePath( Step.IntentGathering ) } />;
	}
};

export default CreateAndRedirect;
