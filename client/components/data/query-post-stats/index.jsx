import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestPostStats } from 'calypso/state/stats/posts/actions';
import { isRequestingPostStats } from 'calypso/state/stats/posts/selectors';

class QueryPostStats extends Component {
	static defaultProps = {
		requestPostStats: () => {},
	};

	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		fields: PropTypes.array,
		// connected props
		requestingPostStats: PropTypes.bool,
		requestPostStats: PropTypes.func,
	};

	componentDidMount() {
		this.requestPostStats();
	}

	componentDidUpdate( prevProps ) {
		const { siteId, postId, fields } = this.props;
		if (
			siteId === prevProps.siteId &&
			postId === prevProps.postId &&
			isEqual( fields, prevProps.fields )
		) {
			return;
		}

		this.requestPostStats();
	}

	requestPostStats() {
		const { siteId, postId, fields, requestingPostStats } = this.props;

		if ( ! requestingPostStats && siteId && typeof postId !== 'undefined' ) {
			this.props.requestPostStats( siteId, postId, fields );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, postId, fields } ) => {
		return {
			requestingPostStats: isRequestingPostStats( state, siteId, postId, fields ),
		};
	},
	{ requestPostStats }
)( QueryPostStats );
