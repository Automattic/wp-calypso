import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsFormData } from '../../site-migration-credentials/types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useRequestAutomatedMigration } from './use-request-automated-migration';

export const useFallbackCredentialsForm = ( onSubmit: ( from?: string ) => void ) => {
	const siteSlug = useSiteSlugParam();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ isBusy, setIsBusy ] = useState( false );

	const {
		mutateAsync: requestAutomatedMigration,
		error,
		variables,
		reset,
	} = useRequestAutomatedMigration( siteSlug );

	const serverSideError = useFormErrorMapping( error, variables );

	const {
		formState: { errors, isSubmitting },
		control,
		handleSubmit,
		watch,
		clearErrors,
	} = useForm< CredentialsFormData >( {
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		disabled: isBusy,
		defaultValues: {
			from_url: importSiteQueryParam,
			username: '',
			password: '',
			notes: '',
		},
		errors: serverSideError,
	} );

	useEffect( () => {
		setIsBusy( isSubmitting );
	}, [ isSubmitting ] );

	const isLoginFailed =
		error?.code === 'automated_migration_tools_login_and_get_cookies_test_failed';

	const submitHandler = handleSubmit( async ( data: CredentialsFormData ) => {
		clearErrors();

		try {
			const payload = {
				...data,
				bypassVerification: isLoginFailed,
			};
			await requestAutomatedMigration( payload );
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit( importSiteQueryParam );
		} catch ( error ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		}
	} );

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
			reset();
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors, reset ] );

	return {
		errors,
		control,
		handleSubmit,
		submitHandler,
		isBusy,
		canBypassVerification: isLoginFailed,
	};
};
