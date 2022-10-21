import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { keys } from '../helpers/input';
import { getEditPostLink } from '../helpers/notes';
import { newPost } from '../state/ui/actions';
import ActionButton from './action-button';

const AnswerPromptButton = ( { newPost, note, translate } ) => {
	const { site: siteId } = note?.meta?.ids ?? {};
	return (
		<ActionButton
			{ ...{
				icon: 'pinned',
				isActive: false,
				hotkey: keys.KEY_E,
				onToggle: () => newPost( siteId, getEditPostLink( note ) ),
				text: translate( 'Post Answer', { context: 'verb: imperative' } ),
				title: translate( 'Post Answer', { context: 'verb: imperative' } ),
			} }
		/>
	);
};

AnswerPromptButton.propTypes = {
	newPost: PropTypes.func.isRequired,
	note: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, { newPost } )( localize( AnswerPromptButton ) );
