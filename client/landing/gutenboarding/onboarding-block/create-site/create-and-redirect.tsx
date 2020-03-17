/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';

interface Props {
	to: string;
}

const CreateAndRedirect = ( { to }: Props ) => {
	const [ redirect, setRedirect ] = useState( false );
	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const { createSite } = useDispatch( STORE_KEY );

	useEffect( () => {
		if ( currentUser ) {
			createSite( currentUser.username, undefined ).then( () => {
				setRedirect( true );
			} );
		}
	}, [ createSite, currentUser, setRedirect ] );

	return redirect ? <Redirect to={ to } /> : null;
};

export default CreateAndRedirect;
