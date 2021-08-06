import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestSubscribedLists } from 'calypso/state/reader/lists/actions';
import { isRequestingSubscribedLists } from 'calypso/state/reader/lists/selectors';

class QueryReaderLists extends Component {
	UNSAFE_componentWillMount() {
		if ( this.props.isRequestingSubscribedLists ) {
			return;
		}

		this.props.requestSubscribedLists();
	}

	render() {
		return null;
	}
}

QueryReaderLists.propTypes = {
	isRequestingSubscribedLists: PropTypes.bool,
	requestSubscribedLists: PropTypes.func,
};

QueryReaderLists.defaultProps = {
	requestSubscribedLists: () => {},
};

export default connect(
	( state ) => {
		return {
			isRequestingSubscribedLists: isRequestingSubscribedLists( state ),
		};
	},
	{
		requestSubscribedLists,
	}
)( QueryReaderLists );
