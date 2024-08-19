import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UseFormClearErrors, UseFormSetError, UseFormWatch } from 'react-hook-form';
import { CredentialsFormData, MigrationError } from './types';
import { useMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useSiteMigrationCredentialsFormHandler = (
	watch: UseFormWatch< CredentialsFormData >,
	clearErrors: UseFormClearErrors< CredentialsFormData >,
	onSubmit: ( data: CredentialsFormData ) => void,
	setError: UseFormSetError< CredentialsFormData >
) => {
	const translate = useTranslate();
	const { saveCredentials } = useMigrationCredentialsMutation();
	const fieldMapping = {
		from_url: 'siteAddress',
	};

	const handleMigrationError = ( err: MigrationError ) => {
		if ( err.body?.code === 'rest_invalid_param' && err.body?.data?.params ) {
			Object.entries( err.body.data.params ).forEach( ( [ key ] ) => {
				setError(
					( fieldMapping[ key as keyof typeof fieldMapping ] ?? key ) as keyof CredentialsFormData,
					{
						type: 'manual',
						message: translate( 'Invalid input, please check again' ),
					}
				);
			} );
		} else {
			setError( 'root', {
				type: 'manual',
				message: err.body?.message ?? translate( 'An error occurred while saving credentials.' ),
			} );
		}
	};

	const submitHandler = async ( data: CredentialsFormData ) => {
		try {
			await saveCredentials( data );
			onSubmit( data );
		} catch ( err ) {
			handleMigrationError( err as MigrationError );
		}
	};

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	return {
		submitHandler,
	};
};
