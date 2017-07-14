/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { isRequestingTopPosts } from 'state/stats/top-posts/selectors';
import { requestTopPosts } from 'state/stats/top-posts/actions';

class QueryTopPosts extends Component {
	static defaultProps = {
		requestTopPosts: () => {},
		period: 'day',
		num: 1,
	};

	static propTypes = {
		siteId: PropTypes.number,
		date: PropTypes.string,
		period: PropTypes.string,
		num: PropTypes.number,
		requestingTopPosts: PropTypes.bool,
		requestTopPosts: PropTypes.func,
	};

	componentWillMount() {
		const { requestingTopPosts, siteId, period, date, num } = this.props;
		if (
			siteId &&
			! requestingTopPosts &&
			! isUndefined( date ) &&
			! isUndefined( period ) &&
			! isUndefined( num )
		) {
			this.requestTopPosts( this.props );
		}
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId, period, date, num } = this.props;
		if (
			! ( siteId && ! isUndefined( period ) && ! isUndefined( date ) && ! isUndefined( num ) ) ||
			( siteId === nextProps.siteId &&
				date === nextProps.date &&
				period === nextProps.period &&
				num === nextProps.num )
		) {
			return;
		}

		this.requestTopPosts( nextProps );
	}

	requestTopPosts( props ) {
		const { siteId, date, period, num } = props;
		props.requestTopPosts( siteId, date, period, num );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId, date, period, num } ) => {
		return {
			requestingTopPosts: isRequestingTopPosts( state, siteId, date, period, num ),
		};
	},
	{ requestTopPosts },
)( QueryTopPosts );
