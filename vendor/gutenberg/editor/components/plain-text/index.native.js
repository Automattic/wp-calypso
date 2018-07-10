/**
 * External dependencies
 */
import { TextInput } from 'react-native';

/**
 * Internal dependencies
 */
import styles from './style.scss';

function PlainText( { onChange, className, ...props } ) {
	return (
		<TextInput
			className={ [ styles[ 'editor-plain-text' ], className ] }
			onChangeText={ ( text ) => onChange( text ) }
			{ ...props }
		/>
	);
}

export default PlainText;
