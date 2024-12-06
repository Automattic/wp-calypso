import { PayPalScriptProvider, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState, createContext, PropsWithChildren, useContext } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

interface PayPalConfigurationApiResponse {
	client_id: string | undefined;
}

export interface PayPalConfiguration {
	clientId: string | undefined;
}

export interface UsePayPalConfiguration {
	payPalConfiguration: PayPalConfiguration | undefined;
}

async function fetchPayPalConfiguration(): Promise< PayPalConfigurationApiResponse > {
	return await wpcomRequest( {
		path: `/me/paypal-configuration`,
		method: 'GET',
	} );
}

const PayPalContext = createContext< PayPalConfiguration | undefined >( undefined );

const defaultConfiguration: PayPalConfiguration = {
	clientId: undefined,
};

function usePayPalConfigurationInternalOnly(): {
	payPalConfiguration: PayPalConfiguration | undefined;
	error: undefined | Error;
} {
	const [ configurationError, setConfigurationError ] = useState< undefined | Error >();
	const [ payPalConfiguration, setConfiguration ] = useState< undefined | PayPalConfiguration >(
		defaultConfiguration
	);

	useEffect( () => {
		let isSubscribed = true;
		fetchPayPalConfiguration()
			.then( ( configuration ) => {
				if ( ! isSubscribed ) {
					return;
				}
				if ( ! configuration.client_id ) {
					throw new Error(
						'Error loading PayPal configuration. Received invalid data from the server.'
					);
				}
				setConfiguration( { clientId: configuration.client_id } );
			} )
			.catch( ( error ) => {
				setConfigurationError( error );
			} );
		return () => {
			isSubscribed = false;
		};
	}, [] );

	return { payPalConfiguration, error: configurationError };
}

export function usePayPalConfiguration(): UsePayPalConfiguration {
	const payPalConfiguration = useContext( PayPalContext );
	if ( ! payPalConfiguration ) {
		throw new Error( 'usePayPalConfiguration can only be used inside a PayPalProvider' );
	}
	return { payPalConfiguration };
}

export function PayPalProvider( {
	children,
	currency,
}: PropsWithChildren< { currency: string } > ) {
	const { payPalConfiguration, error } = usePayPalConfigurationInternalOnly();

	if ( error ) {
		throw error;
	}

	const payPalScriptOptions: ReactPayPalScriptOptions = {
		clientId: payPalConfiguration?.clientId ?? 'loading-client-id',
		components: 'buttons',
		currency,
		commit: true,
		intent: 'capture',
		vault: true,
	};

	const isConfigurationLoaded = payPalConfiguration?.clientId ? true : false;

	const { __ } = useI18n();

	// Even though `PayPalScriptProvider` has a `deferLoading` option, it still
	// requires the `options` prop to include a `clientId`, and it appears that
	// the ID you provide is cached for the lifetime of the provider, even if
	// it later changes. Therefore, we have to avoid loading the
	// `PayPalScriptProvider` at all until we have the correct client ID.
	if ( ! isConfigurationLoaded ) {
		return <div>{ __( 'Loading…' ) }</div>;
	}

	return (
		<PayPalScriptProvider options={ payPalScriptOptions }>
			<PayPalContext.Provider value={ payPalConfiguration }>{ children }</PayPalContext.Provider>
		</PayPalScriptProvider>
	);
}
