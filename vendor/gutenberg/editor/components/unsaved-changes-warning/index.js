/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

class UnsavedChangesWarning extends Component {
	/**
	 * @inheritdoc
	 */
	constructor() {
		super( ...arguments );
		this.warnIfUnsavedChanges = this.warnIfUnsavedChanges.bind( this );
	}

	/**
	 * @inheritdoc
	 */
	componentDidMount() {
		window.addEventListener( 'beforeunload', this.warnIfUnsavedChanges );
	}

	/**
	 * @inheritdoc
	 */
	componentWillUnmount() {
		window.removeEventListener( 'beforeunload', this.warnIfUnsavedChanges );
	}

	/**
	 * Warns the user if there are unsaved changes before leaving the editor.
	 *
	 * @param   {Event}   event Event Object.
	 * @return {string?}       Warning message.
	 */
	warnIfUnsavedChanges( event ) {
		const { isDirty, forceIsDirty = () => false } = this.props;
		if ( isDirty || forceIsDirty() ) {
			event.returnValue = __( 'You have unsaved changes. If you proceed, they will be lost.' );
			return event.returnValue;
		}
	}

	/**
	 * @inheritdoc
	 */
	render() {
		return null;
	}
}

export default withSelect( ( select ) => ( {
	isDirty: select( 'core/editor' ).isEditedPostDirty(),
} ) )( UnsavedChangesWarning );
