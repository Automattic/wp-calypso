/**
 * External dependencies
 */
import TextareaAutosize from 'react-autosize-textarea';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

function PlainText( { onChange, className, ...props } ) {
	return (
		<TextareaAutosize
			className={ classnames( 'editor-plain-text', className ) }
			onChange={ ( event ) => onChange( event.target.value ) }
			{ ...props }
		/>
	);
}

export default PlainText;
