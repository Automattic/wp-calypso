/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingList } from 'state/reader/lists/selectors';
import { requestList } from 'state/reader/lists/actions';

class QueryReaderList extends Component {
	componentWillMount() {
		if ( ! this.props.isRequestingList ) {
			this.props.requestList( this.props.owner, this.props.slug );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if (
			nextProps.isRequestingList ||
			( this.props.owner === nextProps.owner && this.props.slug === nextProps.slug )
		) {
			return;
		}

		nextProps.requestList( nextProps.owner, nextProps.slug );
	}

	render() {
		return null;
	}
}

QueryReaderList.propTypes = {
	owner: PropTypes.string,
	slug: PropTypes.string,
	isRequestingList: PropTypes.bool,
	requestList: PropTypes.func,
};

QueryReaderList.defaultProps = {
	requestList: () => {},
};

export default connect(
	( state, ownProps ) => {
		const { owner, slug } = ownProps;
		return {
			isRequestingList: isRequestingList( state, owner, slug ),
		};
	},
	dispatch => {
		return bindActionCreators(
			{
				requestList,
			},
			dispatch
		);
	}
)( QueryReaderList );
