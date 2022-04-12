import PropTypes from 'prop-types';
import OlarkChatMain from './main';
import OlarkErrorBoundary from './olark-error-boundary';

const OlarkChat = ( { identity, shouldDisablePreChatSurvey, systemsGroupId } ) => {
	return (
		<OlarkErrorBoundary>
			<OlarkChatMain
				identity={ identity }
				shouldDisablePreChatSurvey={ shouldDisablePreChatSurvey }
				systemsGroupId={ systemsGroupId }
			/>
		</OlarkErrorBoundary>
	);
};

OlarkChat.propTypes = {
	identity: PropTypes.string.isRequired,
	shouldDisablePreChatSurvey: PropTypes.bool,
	systemsGroupId: PropTypes.string,
};

OlarkChat.defaultProps = {
	shouldDisablePreChatSurvey: false,
	systemsGroupId: null,
};

export default OlarkChat;
