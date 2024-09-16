import { createHigherOrderComponent } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import useDomainNameserversQuery from 'calypso/data/domains/nameservers/use-domain-nameservers-query';
import useUpdateNameserversMutation from 'calypso/data/domains/nameservers/use-update-nameservers-mutation';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

const noticeOptions = {
	duration: 5000,
	id: `nameserver-update-notification`,
};

const withDomainNameservers = createHigherOrderComponent( ( Wrapped ) => {
	const WithDomainNameservers = ( props ) => {
		const { selectedDomainName } = props;
		const dispatch = useDispatch();
		const translate = useTranslate();
		const { data, isLoading, isError, error } = useDomainNameserversQuery( selectedDomainName );
		const { updateNameservers, isPending } = useUpdateNameserversMutation( selectedDomainName, {
			onSuccess() {
				dispatch(
					successNotice(
						translate( 'Yay, the name servers have been successfully updated!' ),
						noticeOptions
					)
				);
			},
			onError( err ) {
				dispatch(
					errorNotice(
						err.message ?? translate( 'An error occurred while updating the nameservers.' ),
						noticeOptions
					)
				);
			},
		} );

		return (
			<Wrapped
				{ ...props }
				nameservers={ data }
				isLoadingNameservers={ isLoading }
				isUpdatingNameservers={ isPending }
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
