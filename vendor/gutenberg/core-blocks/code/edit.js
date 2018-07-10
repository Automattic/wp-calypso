/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './theme.scss';
import { PlainText } from '@wordpress/editor';

export default function CodeEdit( { attributes, setAttributes, className } ) {
	return (
		<div className={ className }>
			<PlainText
				value={ attributes.content }
				onChange={ ( content ) => setAttributes( { content } ) }
				placeholder={ __( 'Write code…' ) }
				aria-label={ __( 'Code' ) }
			/>
		</div>
	);
}
