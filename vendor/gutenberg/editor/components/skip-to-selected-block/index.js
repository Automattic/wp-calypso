/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal Dependencies
 */
import './style.scss';
import { getBlockFocusableWrapper } from '../../utils/dom';

const SkipToSelectedBlock = ( { selectedBlockUID } ) => {
	const onClick = () => {
		const selectedBlockElement = getBlockFocusableWrapper( selectedBlockUID );
		selectedBlockElement.focus();
	};

	return (
		selectedBlockUID &&
		<Button isDefault type="button" className="editor-skip-to-selected-block" onClick={ onClick }>
			{ __( 'Skip to the selected block' ) }
		</Button>
	);
};

export default withSelect( ( select ) => {
	return {
		selectedBlockUID: select( 'core/editor' ).getBlockSelectionStart(),
	};
} )( SkipToSelectedBlock );
