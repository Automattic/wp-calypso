/**
 * External dependencies
 */
import type { ComponentPropsWithRef, MouseEventHandler, ReactNode, FocusEvent } from 'react';

type Messages = {
	/**
	 * The user added a new token.
	 */
	added: string;
	/**
	 * The user removed an existing token.
	 */
	removed: string;
	/**
	 * The user focused the button to remove the token.
	 */
	remove: string;
	/**
	 * The user tried to add a token that didn't pass the validation.
	 */
	__experimentalInvalid: string;
};

export interface TokenItem {
	/**
	 *  The value of the token.
	 */
	value: string;
	/**
	 * One of 'error', 'validating', or 'success'. Applies styles to token.
	 */
	status?: 'error' | 'success' | 'validating';
	/**
	 * If not falsey, will add a title to the token.
	 */
	title?: string;
	/**
	 * When true, renders tokens as without a background.
	 */
	isBorderless?: boolean;
	/**
	 * Function to call when onMouseEnter event triggered on token.
	 */
	onMouseEnter?: MouseEventHandler< HTMLSpanElement >;
	/**
	 *  Function to call when onMouseLeave is triggered on token.
	 */
	onMouseLeave?: MouseEventHandler< HTMLSpanElement >;
}

export interface FormTokenFieldProps
	extends Pick<
		ComponentPropsWithRef< 'input' >,
		'autoCapitalize' | 'autoComplete' | 'className'
	> {
	label?: string;
	/**
	 * An array of strings to present to the user as suggested tokens.
	 */
	suggestions?: string[];
	/**
	 * The maximum number of suggestions to display at a time.
	 *
	 * @default 100
	 */
	maxSuggestions?: number;
	/**
	 * An array of strings or objects to display as tokens in the field.
	 * If objects are present in the array, they **must** have a property of `value`.
	 */
	value?: ( string | TokenItem )[];
	/**
	 * Function to call to transform tokens for display.
	 * (In the editor, this is needed to decode HTML entities embedded in tags
	 * - otherwise entities like `&` in tag names are double-encoded like `&amp;`,
	 * once by the REST API and once by React).
	 */
	displayTransform?: ( token: string ) => string;
	/**
	 * Function to call to transform tokens for saving. The default is to trim the token value.
	 * This function is also applied when matching suggestions against the current value
	 * so that matching works correctly with leading or trailing spaces. (In the editor,
	 * this is needed to remove leading and trailing spaces from tag names, like wp-admin does.
	 * Otherwise the REST API won't save them.)
	 *
	 * @default ( token: string ) => token.trim()
	 */
	saveTransform?: ( token: string ) => string;
	/**
	 * Function to call when the tokens have changed. An array of new tokens is passed to the callback.
	 *
	 */
	onChange?: ( tokens: ( string | TokenItem )[] ) => void;
	/**
	 * Function to call when the users types in the input field. It can be used to trigger autocomplete requests.
	 *
	 */
	onInputChange?: ( input: string ) => void;
	/**
	 * Function to call when the TokenField has been focused on. The event is passed to the callback. Useful for analytics.
	 *
	 */
	onFocus?: ( event: FocusEvent ) => void;
	/**
	 *  When true, renders tokens as without a background.
	 */
	isBorderless?: boolean;
	/**
	 * If passed, `TokenField` will disable ability to add new tokens once number of tokens is greater than or equal to `maxLength`.
	 */
	maxLength?: number;
	/**
	 * When true, tokens are not able to be added or removed.
	 */
	disabled?: boolean;
	/**
	 * If passed, the `TokenField` input will show a placeholder string if no value tokens are present.
	 */
	placeholder?: string;
	/**
	 * If true, will add a token when `TokenField` is focused and `space` is pressed.
	 */
	tokenizeOnSpace?: boolean;
	/**
	 * Allows customizing the messages presented by screen readers in different occasions:
	 *
	 * -   `added`: The user added a new token.
	 * -   `removed`: The user removed an existing token.
	 * -   `remove` : The user focused the button to remove the token.
	 * -   `__experimentalInvalid`: The user tried to add a token that didn't pass the validation.
	 */
	messages?: Messages;
	/**
	 * If true, the suggestions list will be always expanded when the input field has the focus.
	 */
	__experimentalExpandOnFocus?: boolean;
	/**
	 * If passed, all introduced values will be validated before being added as tokens.
	 *
	 * @default () => true
	 */
	__experimentalValidateInput?: ( token: string ) => boolean;
	/**
	 * If false, the text on how to use the select (ie: _Separate with commas or the Enter key._) will be hidden.
	 *
	 * @default true
	 */
	__experimentalShowHowTo?: boolean;
	/**
	 * Deprecated. Use `__next40pxDefaultSize` instead.
	 *
	 * @default false
	 * @deprecated
	 * @ignore
	 */
	__next36pxDefaultSize?: boolean;
	/**
	 * Start opting into the larger default height that will become the
	 * default size in a future version.
	 *
	 * @default false
	 */
	__next40pxDefaultSize?: boolean;
	/**
	 * If true, the select the first matching suggestion when the user presses
	 * the Enter key (or space when tokenizeOnSpace is true).
	 *
	 * @default false
	 */
	__experimentalAutoSelectFirstMatch?: boolean;
	/**
	 * Custom renderer for suggestions.
	 */
	__experimentalRenderItem?: ( args: { item: string } ) => ReactNode;
	/**
	 * Start opting into the new margin-free styles that will become the default in a future version.
	 *
	 * @default false
	 */
	__nextHasNoMarginBottom?: boolean;
	/**
	 * If true, add any incompleteTokenValue as a new token when the field loses focus.
	 *
	 * @default false
	 */
	tokenizeOnBlur?: boolean;
}

/**
 * `T` can be either a `string` or an object which must have a `value` prop as a string.
 */
export interface SuggestionsListProps<
	T = string | ( Record< string, unknown > & { value: string } ),
> {
	selectedIndex: number;
	scrollIntoView: boolean;
	match: T;
	onHover: ( suggestion: T ) => void;
	onSelect: ( suggestion: T ) => void;
	suggestions: T[];
	displayTransform: ( value: T ) => string;
	instanceId: string | number;
	__experimentalRenderItem?: ( args: { item: T } ) => ReactNode;
}

export interface TokenProps extends TokenItem {
	displayTransform: ( value: string ) => string;
	disabled: boolean;
	onClickRemove: ( { value }: { value: string } ) => void;
	messages: Messages;
	termPosition: number;
	termsCount: number;
}

export interface TokenInputProps {
	isExpanded: boolean;
	instanceId: string | number;
	selectedSuggestionIndex: number;
	onChange?: ( { value }: { value: string } ) => void;
	value: string;
}
