import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { keys } from '../helpers/input';
import { getNewPostLink } from '../helpers/notes';
import { answerPrompt } from '../state/ui/actions';
import ActionButton from './action-button';

// eslint-disable-next-line no-shadow
const AnswerPromptButton = ( { answerPrompt, note, translate } ) => {
	const { site: siteId } = note?.meta?.ids ?? {};
	const newPostLink = getNewPostLink( note );
	return (
		<ActionButton
			{ ...{
				icon: 'pinned',
				isActive: false,
				hotkey: keys.KEY_E,
				onToggle: () => answerPrompt( siteId, newPostLink ),
				text: translate( 'Post Answer', { context: 'verb: imperative' } ),
				title: translate( 'Post Answer', { context: 'verb: imperative' } ),
			} }
		/>
	);
};

AnswerPromptButton.propTypes = {
	answerPrompt: PropTypes.func.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { answerPrompt } )( localize( AnswerPromptButton ) );
