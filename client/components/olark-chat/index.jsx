import PropTypes from 'prop-types';
import { Component } from 'react';
import OlarkChatMain from './main';
import OlarkErrorBoundary from './olark-error-boundary';

class OlarkChat extends Component {
	render() {
		const { identity, shouldDisablePreChatSurvey, systemsGroupId } = this.props;

		return (
			<OlarkErrorBoundary>
				<OlarkChatMain
					identity={ identity }
					shouldDisablePreChatSurvey={ shouldDisablePreChatSurvey }
					systemsGroupId={ systemsGroupId }
				/>
			</OlarkErrorBoundary>
		);
	}
}

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
