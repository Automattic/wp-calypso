/**
 * External dependencies
 */
import { isEmpty, map } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withInstanceId } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';

export function PageTemplate( { availableTemplates, selectedTemplate, instanceId, onUpdate } ) {
	if ( isEmpty( availableTemplates ) ) {
		return null;
	}
	const selectId = `template-selector-${ instanceId }`;
	const onEventUpdate = ( event ) => onUpdate( event.target.value );
	return (
		<div className="editor-page-attributes__template">
			<label htmlFor={ selectId }>{ __( 'Template:' ) }</label>
			<select
				id={ selectId }
				value={ selectedTemplate }
				onBlur={ onEventUpdate }
				onChange={ onEventUpdate }
			>
				{ map( availableTemplates, ( templateName, templateSlug ) => (
					<option key={ templateSlug } value={ templateSlug }>{ templateName }</option>
				) ) }
			</select>
		</div>
	);
}

export default compose(
	withSelect( ( select ) => {
		const { getEditedPostAttribute, getEditorSettings } = select( 'core/editor' );
		const { availableTemplates } = getEditorSettings();
		return {
			selectedTemplate: getEditedPostAttribute( 'template' ),
			availableTemplates,
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onUpdate( templateSlug ) {
			dispatch( 'core/editor' ).editPost( { template: templateSlug || '' } );
		},
	} ) ),
	withInstanceId,
)( PageTemplate );
