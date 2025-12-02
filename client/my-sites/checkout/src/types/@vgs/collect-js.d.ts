declare module '@vgs/collect-js' {
	export namespace VGS {
		/**
		 * Existing VGS Field Types.
		 * See https://www.verygoodsecurity.com/docs/api/collect#api-formfield.
		 */
		type FieldType =
			| 'card-number'
			| 'card-expiration-date'
			| 'card-security-code'
			| 'ssn'
			| 'password'
			| 'text'
			| 'zip-code'
			| 'postal-code'
			| 'file'
			| 'dropdown'
			| 'checkbox';

		/**
		 * VGS Field Properties.
		 * https://www.verygoodsecurity.com/docs/api/collect#api-formfield
		 */
		interface FieldProperties {
			/**
			 * Name of the input field. Will be shown in the form state and used as a data key in the request payload.
			 * https://www.verygoodsecurity.com/docs/api/collect#api-formfield
			 */
			name: string;
			/**
			 * Type of VGS field.
			 */
			type: FieldType;
			ariaLabel: string;
			validations: string[];
			autoComplete?: string;
			options?: Array< { value: string; text: string } >;
			defaultValue?: string;
			hideValue?: boolean;
			css?: VGS.Css;
			showCardIcon?: {
				bottom?: string;
				right?: string;
				transform?: string;
				top?: string;
			};
			icons?: {
				cardPlaceholder: string;
			};
			serializers?: SerializerFunctionResult[];
		}

		/**
		 * This describes the state returned when a card field is updated.
		 * Each key is the name set for the field in FieldProperties.
		 */
		type FormData = Record< string, FieldState >;

		/**
		 * Serializer Options when calling SERIALIZERS.replace.
		 */
		interface ReplaceOptions {
			old: string;
			new: string;
			count: number;
		}

		/**
		 * Serializer Options when calling SERIALIZERS.separate.
		 */
		interface SeparateOptions {
			monthName: string;
			yearName: string;
		}

		type SerializerFunction = (
			options: ReplaceOptions | SeparateOptions
		) => SerializerFunctionResult;

		interface SerializerFunctionResult {
			name: string;
			options: ReplaceOptions | SeparateOptions;
		}

		type Serializers = {
			separate: ( options: SeparateOptions ) => SerializerFunctionResult;
			replace: ( options: ReplaceOptions ) => SerializerFunctionResult;
		};

		interface FieldObject {
			name: string;
			off: ( event: string, listener: () => void ) => void;
			on: ( event: string, listener: () => void ) => void;
			update: ( options: object ) => void;
		}

		interface FormObject {
			fields: FieldObject[];
			field: ( selector: string, properties: FieldProperties ) => FieldObject;
			unmount: () => void;
			submit: (
				url: string,
				options: { [ key: string ]: unknown },
				successCallback: ( status: number, response: TokenizationApiResponse ) => void,
				errorCallback: ( error: SubmissionErrors ) => void
			) => void;
			/**
			 * https://www.verygoodsecurity.com/docs/vgs-collect/js/formatting#serializers
			 */
			SERIALIZERS: Serializers;
			state: { [ fieldName: string ]: FieldState };
		}

		/**
		 * This describes the return value of loadVGSCollect().
		 */
		interface Collect {
			init: ( callback: ( state: FormData ) => void ) => FormObject;
		}

		/**
		 * This describes the state of a single field.
		 * https://www.verygoodsecurity.com/docs/api/collect#api-vgscollectcreate
		 */
		interface FieldState {
			isDirty: boolean;
			isFocused: boolean;
			isValid: boolean;
			isEmpty: boolean;
			isTouched: boolean;
			errorMessages: string[];
			errors: Array< {
				code: number;
				message: string;
				description: string;
				details: unknown;
			} >;
			/**
			 * This name matches the name property set in FieldProperties.
			 */
			name: string;
			/**
			 * Only for the card-number field.
			 * TODO: Make a new type for CardFieldState that extends FieldState.
			 */
			bin: string;
			/**
			 * Only for the card-number field.
			 * TODO: Make a new type for CardFieldState that extends FieldState.
			 */
			last4: string;
			/**
			 * Only for the card-number field.
			 * TODO: Make a new type for CardFieldState that extends FieldState.
			 */
			cardType: string;
		}

		/**
		 * This describes the CSS that can be passed to a field.
		 * https://www.verygoodsecurity.com/docs/vgs-collect/js/customization#fields-styling
		 */
		interface Css {
			[ key: string ]: string | Css | undefined;
		}

		/**
		 * This describes errors upon submitting the form.
		 * https://www.verygoodsecurity.com/docs/api/collect#api-formsubmit
		 */
		interface SubmissionErrors {
			[ fieldName: string ]: Record< string, unknown >;
		}

		interface TokenizedCardData {
			card_number: string;
			card_exp: string;
			card_cvc: string;
			card_holder: string;
		}

		interface TokenizationApiResponse {
			json: TokenizedCardData;
		}
	}

	// This is needed because we named our VGS types module the same name as the npm package.
	/**
	 * loadVGSCollect is actually being imported from the `@vgs/collect-js` npm package.
	 */
	export const loadVGSCollect: ( options: {
		vaultId: string;
		environment: string;
		version: string;
	} ) => Promise< VGS.Collect >;
}
