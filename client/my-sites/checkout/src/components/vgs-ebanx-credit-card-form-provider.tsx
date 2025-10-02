import { loadVGSCollect } from '@vgs/collect-js';
import {
	VGSCollectFormState,
	VGSCollectHttpStatusCode,
	VGSCollectVaultEnvironment,
	useVGSCollectState,
	useVGSCollectFormInstance,
	IVGSCollectForm,
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
	formData: VGSCollectFormState | undefined;
	form: IVGSCollectForm | null;
	formSubmitAttempted: boolean;
	setFormSubmitAttempted: ( attempted: boolean ) => void;
	submitForm: () => Promise< unknown >;
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
	}, [ data, isSuccess ] );

	const submitForm = useCallback( () => {
		if ( ! form ) {
			return Promise.reject( new Error( 'Form is undefined' ) );
		}

		return new Promise< unknown >( ( resolve, reject ) => {
			form.submit(
				'/post',
				{},
				( status: VGSCollectHttpStatusCode, response: unknown ) => {
					if ( status === 200 ) {
						resolve( response );
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
