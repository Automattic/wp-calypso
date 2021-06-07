/**
 * External dependencies
 */
import React from 'react';
import { useMutation } from 'react-query';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import wp from 'calypso/lib/wp';

const useSuccessNotice = ( isSuccess ) => {
	const showNotice = React.useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		showNotice.current = () => {
			dispatch(
				successNotice(
					translate( 'Request successful! We are sending you our DPA via email', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ),
					{ id: 'request-dpa-notice' }
				)
			);
		};
	}, [ dispatch, translate ] );

	React.useEffect( () => {
		isSuccess && showNotice.current();
	}, [ isSuccess ] );
};

const useErrorNotice = ( isError, error ) => {
	const showNotice = React.useRef();
	const dispatch = useDispatch();
	const translate = useTranslate();

	React.useEffect( () => {
		showNotice.current = () => {
			dispatch(
				errorNotice(
					error.error === 'too_many_requests'
						? error.message
						: translate( 'There was an error requesting a DPA', {
								comment:
									'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
						  } ),
					{ id: 'request-dpa-notice' }
				)
			);
		};
	}, [ dispatch, translate, error ] );

	React.useEffect( () => {
		isError && showNotice.current();
	}, [ isError ] );
};

const useRequestDpaMutation = () =>
	useMutation( () => wp.req.post( '/me/request-dpa', { apiNamespace: 'wpcom/v2' } ) );

const DPA = () => {
	const translate = useTranslate();
	const {
		mutate: requestDpa,
		isLoading: isRequestingDpa,
		isSuccess,
		isError,
		error,
	} = useRequestDpaMutation();

	useSuccessNotice( isSuccess );
	useErrorNotice( isError, error );

	return (
		<>
			<SectionHeader
				label={ translate( 'Data processing addendum', {
					comment:
						'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
				} ) }
			/>
			<Card>
				<p>
					{ translate(
						'A Data Processing Addendum (DPA) allows web sites and companies to assure customers, vendors, ' +
							'and partners that their data handling complies with the law.'
					) }
				</p>

				<p>
					{ translate( 'Note: most free site owners or hobbyists do not need a DPA.', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ) }
				</p>

				<p>
					<strong>
						{ translate(
							'Having a DPA does not change any of our privacy and security practices for site visitors. ' +
								'Everyone using our service gets the same high standards of privacy and security.',
							{
								comment:
									'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
							}
						) }
					</strong>
				</p>
				<Button
					className="privacy__dpa-request-button"
					disabled={ isRequestingDpa }
					onClick={ () => requestDpa() }
				>
					{ translate( 'Request a DPA', {
						comment:
							'A Data Processing Addendum (DPA) is a document to assure customers, vendors, and partners that their data handling complies with the law.',
					} ) }
				</Button>
			</Card>
		</>
	);
};

export default DPA;
