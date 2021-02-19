/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getEmailAccounts } from 'calypso/state/email-accounts/actions';
import isRequestingEmailAccounts from 'calypso/state/selectors/is-requesting-email-accounts';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingEmailAccounts( getState(), siteId ) ) {
		dispatch( getEmailAccounts( siteId ) );
	}
};

export default function QueryEmailAccounts( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryEmailAccounts.propTypes = {
	siteId: PropTypes.number.isRequired,
};
