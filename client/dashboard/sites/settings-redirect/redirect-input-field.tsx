import {
	__experimentalInputControl as InputControl,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface RedirectInputFieldProps {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	label?: string;
}

/**
 * Custom input field component for redirect URL input.
 * Handles the common pattern of stripping http:// prefix and adding it back as a visual prefix.
 */
export default function RedirectInputField( {
	value,
	onChange,
	placeholder = __( 'Enter destination URL' ),
	label = __( 'Redirect URL' ),
}: RedirectInputFieldProps ) {
	const withoutHttp = ( url: string ) => {
		return url.replace( /^https?:\/\//, '' );
	};

	return (
		<InputControl
			placeholder={ placeholder }
			label={ label }
			prefix={ <InputControlPrefixWrapper>http://</InputControlPrefixWrapper> }
			__next40pxDefaultSize
			value={ value }
			onChange={ ( newValue ) => {
				const processedValue = withoutHttp( newValue ?? '' );
				onChange( processedValue );
			} }
		/>
	);
}
