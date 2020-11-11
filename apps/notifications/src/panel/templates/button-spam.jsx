/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { spamNote } from '../state/notes/thunks';
import ActionButton from './action-button';
import { keys } from '../helpers/input';

const SpamButton = ( { note, translate, spamNote } ) => (
	<ActionButton
		{ ...{
			icon: 'spam',
			isActive: false,
			hotkey: keys.KEY_S,
			onToggle: () => spamNote( note ),
			text: translate( 'Spam', { context: 'verb: Mark as Spam' } ),
			title: translate( 'Mark comment as spam', { context: 'verb: imperative' } ),
		} }
	/>
);

SpamButton.propTypes = {
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { spamNote } )( localize( SpamButton ) );
