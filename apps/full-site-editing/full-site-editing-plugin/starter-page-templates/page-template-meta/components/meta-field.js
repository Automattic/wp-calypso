/**
 * External dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { TextControl, TextareaControl } from '@wordpress/components';

export const MetaField = ( { label, inputType, type, metaFieldValue, setMetaFieldValue } ) => {
	const FormComponent = type === 'textarea' ? TextareaControl : TextControl;

	return (
		<FormComponent
			label={ label }
			type={ inputType || 'text' }
			value={ metaFieldValue }
			rows="5"
			onChange={ setMetaFieldValue }
		/>
	);
};

export default compose( [
	withSelect( ( select, { metaFieldKey } ) => {
		const metaFieldValue = select( 'core/editor' ).getEditedPostAttribute( 'meta' )[ metaFieldKey ];

		return {
			metaFieldValue,
		};
	} ),
	withDispatch( ( dispatch, { metaFieldKey } ) => {
		return {
			setMetaFieldValue: function( value ) {
				dispatch( 'core/editor' ).editPost( {
					meta: {
						[ metaFieldKey ]: value,
					},
				} );
			},
		};
	} ),
] )( MetaField );
