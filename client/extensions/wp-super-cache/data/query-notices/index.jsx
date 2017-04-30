/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingNotices } from '../../state/notices/selectors';
import { requestNotices } from '../../state/notices/actions';

class QueryNotices extends Component {
	componentWillMount() {
		this.requestNotices( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestNotices( nextProps );
	}

	requestNotices( props ) {
		const { requestingNotices, siteId } = props;

		if ( ! requestingNotices && siteId ) {
			props.requestNotices( siteId );
		}
	}

	render() {
		return null;
	}
}

QueryNotices.propTypes = {
	siteId: PropTypes.number,
	requestingNotices: PropTypes.bool,
	requestNotices: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingNotices: isRequestingNotices( state, siteId ),
		};
	},
	{ requestNotices }
)( QueryNotices );
