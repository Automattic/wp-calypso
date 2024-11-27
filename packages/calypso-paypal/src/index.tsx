import { PayPalScriptProvider, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { useEffect, useState, createContext, PropsWithChildren, useContext } from 'react';
import wpcomRequest from 'wpcom-proxy-request';

interface PayPalConfigurationApiResponse {
	client_id: string | undefined;
}

export type FetchPayPalConfiguration = () => Promise< PayPalConfigurationApiResponse >;

export interface PayPalConfiguration {
	clientId: string | undefined;
}

export interface UsePayPalConfiguration {
	payPalConfiguration: PayPalConfiguration | undefined;
}

async function defaultFetchPayPalConfiguration(): Promise< PayPalConfigurationApiResponse > {
	return await wpcomRequest( {
		path: `/me/paypal-configuration`,
		method: 'GET',
	} );
}

const PayPalContext = createContext< PayPalConfiguration | undefined >( undefined );

const defaultConfiguration: PayPalConfiguration = {
	clientId: undefined,
};

function usePayPalConfigurationInternalOnly( {
	fetchPayPalConfiguration,
}: {
	fetchPayPalConfiguration?: FetchPayPalConfiguration;
} ): {
	payPalConfiguration: PayPalConfiguration | undefined;
	error: undefined | Error;
} {
	const [ configurationError, setConfigurationError ] = useState< undefined | Error >();
	const [ payPalConfiguration, setConfiguration ] = useState< undefined | PayPalConfiguration >(
		defaultConfiguration
	);

	useEffect( () => {
		let isSubscribed = true;
		( fetchPayPalConfiguration ?? defaultFetchPayPalConfiguration )()
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
	}, [ fetchPayPalConfiguration ] );

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
	fetchPayPalConfiguration,
}: PropsWithChildren< {
	currency: string;
	fetchPayPalConfiguration?: FetchPayPalConfiguration;
} > ) {
	const { payPalConfiguration, error } = usePayPalConfigurationInternalOnly( {
		fetchPayPalConfiguration,
	} );

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

	return (
		<PayPalScriptProvider
			options={ isConfigurationLoaded ? payPalScriptOptions : undefined }
			deferLoading={ isConfigurationLoaded ? false : true }
		>
			<PayPalContext.Provider value={ payPalConfiguration }>{ children }</PayPalContext.Provider>
		</PayPalScriptProvider>
	);
}
