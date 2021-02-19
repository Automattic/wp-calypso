/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { requestVerticals } from 'calypso/state/signup/verticals/actions';
import { getVerticals } from 'calypso/state/signup/verticals/selectors';

export class QueryVerticals extends Component {
	static propTypes = {
		isFetched: PropTypes.bool,
		searchTerm: PropTypes.string,
		siteType: PropTypes.string,
		limit: PropTypes.number,
		debounceTime: PropTypes.number,
		debounceFunc: PropTypes.func,
	};

	static defaultProps = {
		isFetched: false,
		limit: 7,
		searchTerm: '',
		siteType: '',
		debounceTime: 0,
		debounceFunc: debounce,
	};

	bindDebouncedRequest = () => {
		const { debounceTime, debounceFunc } = this.props;

		if ( debounceTime > 0 ) {
			return debounceFunc( this.props.requestVerticals, this.props.debounceTime );
		}

		return this.props.requestVerticals;
	};

	componentDidMount() {
		const { searchTerm = '', siteType, limit, isFetched } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		this.debouncedRequest = this.bindDebouncedRequest();

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, siteType, limit );
		}
	}

	componentDidUpdate( prevProps ) {
		const { isFetched, searchTerm, siteType, limit, debounceTime } = this.props;
		const trimmedSearchTerm = searchTerm.trim();

		if ( prevProps.debounceTime !== debounceTime ) {
			this.debouncedRequest = this.bindDebouncedRequest();
		}

		if ( ! isFetched && trimmedSearchTerm ) {
			this.debouncedRequest( trimmedSearchTerm, siteType, limit );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => ( {
		isFetched: null !== getVerticals( state, ownProps.searchTerm, ownProps.siteType ),
	} ),
	{
		requestVerticals,
	}
)( QueryVerticals );
