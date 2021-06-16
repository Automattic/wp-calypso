/**
 * External dependencies
 */
import React, { useRef, useEffect } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import useDomainNameserversQuery from 'calypso/data/domains/nameservers/use-domain-nameservers-query';
import useUpdateNameserversMutation from 'calypso/data/domains/nameservers/use-update-nameservers-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const noticeOptions = {
	duration: 5000,
	id: `nameserver-update-notification`,
};

const useSuccessNotice = ( isSuccess ) => {
	const showNotice = useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		showNotice.current = () => {
			dispatch(
				successNotice(
					translate( 'Yay, the name servers have been successfully updated!' ),
					noticeOptions
				)
			);
		};
	}, [ dispatch, translate ] );

	useEffect( () => {
		isSuccess && showNotice.current();
	}, [ isSuccess ] );
};

const useErrorNotice = ( isError, error ) => {
	const showNotice = useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		showNotice.current = () => {
			const defaultMessage = translate( 'An error occurred while updating the nameservers.' );
			dispatch( errorNotice( error?.message ?? defaultMessage, noticeOptions ) );
		};
	}, [ dispatch, translate, error ] );

	useEffect( () => {
		isError && showNotice.current();
	}, [ isError ] );
};

const withDomainNameservers = createHigherOrderComponent( ( Wrapped ) => {
	const WithDomainNameservers = ( props ) => {
		const { selectedDomainName } = props;
		const { data, isLoading, isError, error } = useDomainNameserversQuery( selectedDomainName );
		const {
			updateNameservers,
			isSuccess: isUpdateSuccess,
			isError: isUpdateError,
			error: updateError,
		} = useUpdateNameserversMutation( selectedDomainName );

		useSuccessNotice( isUpdateSuccess );
		useErrorNotice( isUpdateError, updateError );

		return (
			<Wrapped
				{ ...props }
				nameservers={ data }
				isLoadingNameservers={ isLoading }
				loadingNameserversError={ isError && error }
				updateNameservers={ updateNameservers }
			/>
		);
	};

	WithDomainNameservers.propTypes = {
		selectedDomainName: PropTypes.string.isRequired,
	};

	return WithDomainNameservers;
}, 'WithDomainNameservers' );

export default withDomainNameservers;
