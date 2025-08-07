import { __experimentalInputControl as InputControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { NameServerField, MIN_NAME_SERVERS_LENGTH } from './types';
import { validateHostname } from './utils';

export const validateField = ( value: string, index: number ): string => {
	if ( value === '' ) {
		if ( index < MIN_NAME_SERVERS_LENGTH ) {
			return __( 'This field is required' );
		}
		return '';
	}
	if ( ! validateHostname( value ) ) {
		return __( 'Please enter a valid hostname' );
	}
	return '';
};

interface Props {
	index: number;
	field: NameServerField;
	disabled: boolean;
	onChange: ( index: number, value: string ) => void;
	onBlur: ( index: number ) => void;
}

export const NameServerInput = ( { index, field, disabled, onChange, onBlur }: Props ) => (
	<div className={ `nameserver-input-container ${ field.error ? 'is-error' : '' }` }>
		<InputControl
			key={ index }
			__next40pxDefaultSize
			disabled={ disabled }
			type="text"
			id={ `nameserver-${ index + 1 }` }
			// translators: %s is the name server number (1-4)
			label={ sprintf( __( 'Custom name server %s' ), index + 1 ) }
			placeholder={
				index < MIN_NAME_SERVERS_LENGTH
					? // translators: %s is the name server number (1-4)
					  sprintf( __( 'ns%s.domain.com' ), index + 1 )
					: // translators: %s is the name server number (1-4)
					  sprintf( __( 'ns%s.domain.com (optional)' ), index + 1 )
			}
			value={ field.value }
			onChange={ ( value ) => onChange( index, value as string ) }
			onBlur={ () => onBlur( index ) }
		/>
		{ field.error && <div className="validation-msg">{ field.error }</div> }
	</div>
);
