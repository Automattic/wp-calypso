/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from './dialog';

export default connect( state => {
	return { contactForm: state.ui.editor.contactForm };
} )( Dialog );
