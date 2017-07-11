/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPages } from '../../../state/pages/actions';
import { isFetchingPages } from '../../../state/pages/selectors';

class QueryPages extends Component {
	static propTypes = {
		fetchPages: PropTypes.func,
		fetchingPages: PropTypes.bool,
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.fetchPages( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;

		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.fetchPages( nextProps );
	}

	fetchPages( props ) {
		const { fetchingPages, siteId } = props;

		if ( ! fetchingPages && siteId ) {
			props.fetchPages( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( { fetchingPages: isFetchingPages( state, siteId ) } ),
	{ fetchPages }
)( QueryPages );
