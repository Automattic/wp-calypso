/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import EmailFollowersStore from 'lib/email-followers/store';
import EmailFollowersActions from 'lib/email-followers/actions';
import passToChildren from 'lib/react-pass-to-children';
import pollers from 'lib/data-poller';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:email-followers-data' );

export default class EmailFollowersData extends Component {
	static propTypes = {
		fetchOptions: PropTypes.object.isRequired,
	};

	static initialState = {
		followers: false,
		totalFollowers: false,
		currentPage: false,
		fetchInitialized: false,
	};

	state = this.constructor.initialState;

	componentDidMount() {
		EmailFollowersStore.on( 'change', this.refreshFollowers );
		this.fetchIfEmpty( this.props.fetchOptions );
		this._poller = pollers.add(
			EmailFollowersStore,
			EmailFollowersActions.fetchFollowers.bind(
				EmailFollowersActions,
				this.props.fetchOptions,
				true
			),
			{ leading: false }
		);
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.fetchOptions ) {
			return;
		}
		if ( ! isEqual( this.props.fetchOptions, nextProps.fetchOptions ) ) {
			this.setState( this.constructor.initialState );
			this.fetchIfEmpty( nextProps.fetchOptions );
			pollers.remove( this._poller );
			this._poller = pollers.add(
				EmailFollowersStore,
				EmailFollowersActions.fetchFollowers.bind(
					EmailFollowersActions,
					nextProps.fetchOptions,
					true
				),
				{ leading: false }
			);
		}
	}

	componentWillUnmount() {
		EmailFollowersStore.removeListener( 'change', this.refreshFollowers );
		pollers.remove( this._poller );
	}

	fetchIfEmpty = ( fetchOptions ) => {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		if ( ! fetchOptions || ! fetchOptions.siteId ) {
			return;
		}
		if ( EmailFollowersStore.getFollowers( fetchOptions ).length ) {
			this.refreshFollowers( fetchOptions );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		const defer = function () {
			const paginationData = EmailFollowersStore.getPaginationData( fetchOptions );
			if ( paginationData.fetchingFollowers ) {
				return;
			}
			EmailFollowersActions.fetchFollowers( fetchOptions );
			this.setState( { fetchInitialized: true } );
		}.bind( this );
		setTimeout( defer, 0 );
	};

	isFetching = () => {
		const fetchOptions = this.props.fetchOptions;
		if ( ! fetchOptions.siteId ) {
			debug( 'Is fetching because siteId is falsey' );
			return true;
		}
		if ( ! this.state.followers ) {
			debug( 'Is fetching because not followers' );
			return true;
		}

		const followersPaginationData = EmailFollowersStore.getPaginationData( fetchOptions );
		debug( 'Followers pagination data: ' + JSON.stringify( followersPaginationData ) );

		if ( followersPaginationData.fetchingFollowers ) {
			return true;
		}
		return false;
	};

	refreshFollowers = ( fetchOptions ) => {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		debug( 'Refreshing followers: ' + JSON.stringify( fetchOptions ) );
		this.setState( {
			followers: EmailFollowersStore.getFollowers( fetchOptions ),
			totalFollowers: EmailFollowersStore.getPaginationData( fetchOptions ).totalFollowers,
			currentPage: EmailFollowersStore.getPaginationData( fetchOptions ).followersCurrentPage,
		} );
	};

	render() {
		return passToChildren( this, Object.assign( {}, this.state, { fetching: this.isFetching() } ) );
	}
}
