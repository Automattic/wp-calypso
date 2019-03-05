/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';

const simpleInput = ( type, props, label, view, onChange ) => {
	const { isSelected } = props;
	const value = props.attributes[ type ];
	return (
		<div
			className={ isSelected ? `jetpack-${ type }-block is-selected` : `jetpack-${ type }-block` }
		>
			{ ! isSelected && value !== '' && view( props ) }
			{ ( isSelected || value === '' ) && (
				<PlainText
					value={ value }
					placeholder={ label }
					aria-label={ label }
					onChange={ onChange }
				/>
			) }
		</div>
	);
};

export default simpleInput;
