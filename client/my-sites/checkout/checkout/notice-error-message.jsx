import PropTypes from 'prop-types';

const NoticeErrorMessage = ( { message = '' } ) => <strong>{ message }</strong>;

NoticeErrorMessage.propTypes = {
	message: PropTypes.string,
};

export default NoticeErrorMessage;
