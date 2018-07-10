/** @format */

import { View, Text } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PlainText } from '@wordpress/editor';
import styles from './editor.scss';

export default function MoreEdit( { attributes, setAttributes } ) {
	const { customText } = attributes;
	const defaultText = __( 'Read more' );
	const value = customText !== undefined ? customText : defaultText;

	return (
		<View className={ styles[ 'core-blocks-more__container' ] }>
			<View className={ styles[ 'core-blocks-more__sub-container' ] }>
				<Text className={ styles[ 'core-blocks-more__left-marker' ] }>&lt;!--</Text>
				<PlainText
					className={ styles[ 'core-blocks-more__plain-text' ] }
					value={ value }
					multiline={ true }
					underlineColorAndroid="transparent"
					onChange={ ( newValue ) => setAttributes( { customText: newValue } ) }
					placeholder={ defaultText }
				/>
				<Text className={ styles[ 'core-blocks-more__right-marker' ] }>--&gt;</Text>
			</View>
		</View> );
}
