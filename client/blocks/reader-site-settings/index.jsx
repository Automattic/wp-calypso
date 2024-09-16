import PropTypes from 'prop-types';
import ReaderSettingsIcon from 'calypso/reader/components/icons/reader-settings-icon';

import './style.scss';

const ReaderSettingsButton = ( { iconSize } ) => {
	return <ReaderSettingsIcon width={ iconSize } height={ iconSize } />;
};

ReaderSettingsButton.propTypes = {
	iconSize: PropTypes.number,
};

ReaderSettingsButton.defaultProps = {
	iconSize: 24,
};
