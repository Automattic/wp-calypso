/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ViewersStore from 'client/lib/viewers/store';
import ViewersActions from 'client/lib/viewers/actions';
import passToChildren from 'client/lib/react-pass-to-children';

export default class ViewersData extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	static initialState = {
		viewers: false,
		totalViewers: false,
		currentPage: false,
		fetchInitialized: false,
	};

	state = this.constructor.initialState;

	componentDidMount() {
		ViewersStore.on( 'change', this.refreshViewers );
		this.fetchIfEmpty( this.props.siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId ) {
			return;
		}
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( this.constructor.initialState );
			this.fetchIfEmpty( nextProps.siteId );
		}
	}

	componentWillUnmount() {
		ViewersStore.removeListener( 'change', this.refreshViewers );
	}

	fetchIfEmpty = siteId => {
		siteId = siteId || this.props.siteId;
		if ( ! siteId ) {
			return;
		}
		if ( ViewersStore.getViewers( siteId ).length ) {
			this.refreshViewers( siteId );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		let defer = function() {
			var paginationData = ViewersStore.getPaginationData( siteId );
			if ( paginationData.fetchingViewers ) {
				return;
			}
			ViewersActions.fetch( siteId );
			this.setState( { fetchInitialized: true } );
		}.bind( this );
		setTimeout( defer, 0 );
	};

	isFetching = () => {
		let siteId = this.props.siteId;
		if ( ! siteId ) {
			return true;
		}

		if ( ! this.state.viewers ) {
			return true;
		}

		let paginationData = ViewersStore.getPaginationData( siteId );

		if ( paginationData.fetchingViewers ) {
			return true;
		}
		return false;
	};

	refreshViewers = siteId => {
		siteId = siteId || this.props.siteId;
		this.setState( {
			viewers: ViewersStore.getViewers( siteId ),
			totalViewers: ViewersStore.getPaginationData( siteId ).totalViewers,
			currentPage: ViewersStore.getPaginationData( siteId ).currentViewersPage,
		} );
	};

	render() {
		return passToChildren( this, Object.assign( {}, this.state, { fetching: this.isFetching() } ) );
	}
}
