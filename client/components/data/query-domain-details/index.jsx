import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDomainDetails } from 'calypso/state/sites/domains/actions';
import { isRequestingDomainDetails } from 'calypso/state/sites/domains/selectors';

const request = ( domainName ) => ( dispatch, getState ) => {
	if ( domainName && ! isRequestingDomainDetails( getState(), domainName ) ) {
		dispatch( fetchDomainDetails( domainName ) );
	}
};

export default function QueryDomainDetails( { domainName } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( domainName ) );
	}, [ dispatch, domainName ] );

	return null;
}

QueryDomainDetails.propTypes = { domainName: PropTypes.string.isRequired };
