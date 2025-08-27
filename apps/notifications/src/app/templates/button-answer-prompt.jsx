import { __ } from '@wordpress/i18n';
import { pin } from '@wordpress/icons';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { keys } from '../../panel/helpers/input';
import { getNewPostLink } from '../../panel/helpers/notes';
import { answerPrompt } from '../../panel/state/ui/actions';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const AnswerPromptButton = ( { answerPrompt, note } ) => {
	const { site: siteId } = note?.meta?.ids ?? {};
	// Notifications are hosted on widgets.wp.com on WordPress.com
	const host =
		document.location.host === 'widgets.wp.com' ? 'wordpress.com' : document.location.host;
	const newPostLink = document.location.protocol + '//' + host + getNewPostLink( note );
	return (
		<ActionButton
			icon={ pin }
			isActive={ false }
			hotkey={ keys.KEY_E }
			onToggle={ () => answerPrompt( siteId, newPostLink ) }
			text={ __( 'Post Answer' ) }
			title={ __( 'Post Answer' ) }
		/>
	);
};

AnswerPromptButton.propTypes = {
	answerPrompt: PropTypes.func.isRequired,
	note: PropTypes.object.isRequired,
};

export default connect( null, { answerPrompt } )( AnswerPromptButton );
