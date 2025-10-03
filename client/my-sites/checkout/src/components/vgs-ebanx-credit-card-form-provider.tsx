import { loadVGSCollect, VGS } from '@vgs/collect-js';
import {
	VGSCollectHttpStatusCode,
	VGSCollectVaultEnvironment,
	useVGSCollectState,
	useVGSCollectFormInstance,
	VGSCollectProvider,
} from '@vgs/collect-js-react';
import { __ } from '@wordpress/i18n';
import {
	useState,
	useCallback,
	useEffect,
	ReactNode,
	useMemo,
	createContext,
	useContext,
} from 'react';
import { useVaultId } from '../hooks/use-vault-id';

export interface VgsEbanxCreditCardFormContextType {
	formData: VGS.FormData;
	setFormData: React.Dispatch< React.SetStateAction< VGS.FormData > >;
	setFormSubmitAttempted: React.Dispatch< React.SetStateAction< boolean > >;
	setForm: React.Dispatch< React.SetStateAction< VGS.FormObject | undefined > >;
	form: VGS.FormObject | undefined;
	formSubmitAttempted: boolean;
	submitForm: () => Promise< VGS.TokenizedCardData >;
	formLoadingError: boolean;
	isVGSCollectScriptLoaded: boolean;
	vaultId: string;
	environment: string;
}

const VgsEbanxCreditCardFormContext = createContext<
	VgsEbanxCreditCardFormContextType | undefined
>( undefined );

interface VgsEbanxCreditCardFormProviderProps {
	children: ReactNode;
}

export const VgsEbanxCreditCardFormProvider = ( {
	children,
}: VgsEbanxCreditCardFormProviderProps ) => {
	const [ formSubmitAttempted, setFormSubmitAttempted ] = useState< boolean >( false );
	const [ formLoadingError, setFormLoadingError ] = useState( false );
	const [ isVGSCollectScriptLoaded, setCollectScriptLoaded ] = useState( false );
	const { data, isSuccess } = useVaultId();

	// VGS Collect React hooks
	const [ formData ] = useVGSCollectState();
	const [ form ] = useVGSCollectFormInstance();

	useEffect( () => {
		const initializeVGS = async () => {
			try {
				if ( ! isSuccess || ! data ) {
					return;
				}

				await loadVGSCollect( {
					vaultId: data.vault_id as string,
					environment: data.environment as VGSCollectVaultEnvironment,
					version: '3.2.2',
				} );

				setCollectScriptLoaded( true );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to load VGS Collect:', error );
				setFormLoadingError( true );
			}
		};

		initializeVGS();
	}, [ form, data, isSuccess ] );

	const submitForm = useCallback( () => {
		if ( ! form ) {
			return Promise.reject( new Error( 'Form is undefined' ) );
		}

		return new Promise< VGS.TokenizedCardData >( ( resolve, reject ) => {
			form.submit(
				'/post',
				{},
				( status: VGSCollectHttpStatusCode, response: unknown ) => {
					if ( status === 200 ) {
						resolve( response.json );
					} else {
						reject(
							new Error(
								`Form submission failed with status ${ status }: ${ JSON.stringify( response ) }`
							)
						);
					}
				},
				( error: unknown ) => {
					reject( new Error( `Form validation failed: ${ JSON.stringify( error ) }` ) );
				}
			);
		} );
	}, [ form ] );

	const contextValue = useMemo(
		() => ( {
			formData,
			form,
			formSubmitAttempted,
			setFormSubmitAttempted,
			submitForm,
			formLoadingError,
			isVGSCollectScriptLoaded,
			vaultId: data?.vault_id || '',
			environment: data?.environment || 'sandbox',
		} ),
		[
			formData,
			form,
			submitForm,
			formSubmitAttempted,
			formLoadingError,
			isVGSCollectScriptLoaded,
			data,
		]
	);

	return formLoadingError ? (
		<div className="wc-block-components-notices">
			<div className="wc-block-components-notice wc-block-components-notice--error">
				{ __(
					'Unable to load the payment form due to a temporary issue. Please refresh the page or try again later.',
					'calypso'
				) }
			</div>
		</div>
	) : (
		<VGSCollectProvider>
			<VgsEbanxCreditCardFormContext.Provider value={ contextValue }>
				{ children }
			</VgsEbanxCreditCardFormContext.Provider>
		</VGSCollectProvider>
	);
};

export const useVgsEbanxCreditCardForm = () => {
	const context = useContext( VgsEbanxCreditCardFormContext );
	if ( context === undefined ) {
		throw new Error(
			'useVgsEbanxCreditCardForm must be used within a VgsEbanxCreditCardFormProvider'
		);
	}
	return context;
};
