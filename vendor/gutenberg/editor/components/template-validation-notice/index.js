/**
 * WordPress dependencies
 */
import { Notice, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

function TemplateValidationNotice( { isValid, ...props } ) {
	if ( isValid ) {
		return null;
	}

	const confirmSynchronization = () => {
		// eslint-disable-next-line no-alert
		if ( window.confirm( __( 'Resetting the template may result in loss of content, do you want to continue?' ) ) ) {
			props.synchronizeTemplate();
		}
	};

	return (
		<Notice className="editor-template-validation-notice" isDismissible={ false } status="warning">
			<p>{ __( 'The content of your post doesn\'t match the template assigned to your post type.' ) }</p>
			<div>
				<Button isDefault onClick={ props.resetTemplateValidity }>{ __( 'Keep it as is' ) }</Button>
				<Button onClick={ confirmSynchronization } isPrimary>{ __( 'Reset the template' ) }</Button>
			</div>
		</Notice>
	);
}

export default compose( [
	withSelect( ( select ) => ( {
		isValid: select( 'core/editor' ).isValidTemplate(),
	} ) ),
	withDispatch( ( dispatch ) => {
		const { setTemplateValidity, synchronizeTemplate } = dispatch( 'core/editor' );
		return {
			resetTemplateValidity: () => setTemplateValidity( true ),
			synchronizeTemplate,
		};
	} ),
] )( TemplateValidationNotice );
