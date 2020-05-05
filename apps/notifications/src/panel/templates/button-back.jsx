/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

import actions from '../state/actions';

/**
 * Internal dependencies
 */
import Gridicon from './gridicons';

const routeBack = ( global, unselectNote ) => ( event ) => {
	event.stopPropagation();
	event.preventDefault();
	global.input.lastInputWasKeyboard = false;
	unselectNote();
};

export const BackButton = ( { global, isEnabled, translate, unselectNote } ) => {
	const backText = translate( 'Back', {
		context: 'go back (like the back button in a browser)',
	} );

	return isEnabled ? (
		<button className="wpnc__back" onClick={ routeBack( global, unselectNote ) }>
			<Gridicon icon="arrow-left" size={ 18 } />
			{ backText }
		</button>
	) : (
		<button className="wpnc__back disabled" disabled="disabled">
			<Gridicon icon="arrow-left" size={ 18 } />
			{ backText }
		</button>
	);
};

BackButton.propTypes = {
	isEnabled: PropTypes.bool.isRequired,
};

const mapDispatchToProps = {
	unselectNote: actions.ui.unselectNote,
};

export default connect( null, mapDispatchToProps )( localize( BackButton ) );
