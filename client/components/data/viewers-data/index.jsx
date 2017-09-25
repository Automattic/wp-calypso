/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ViewersStore from 'lib/viewers/store';
import ViewersActions from 'lib/viewers/actions';
import passToChildren from 'lib/react-pass-to-children';

export default React.createClass( {
	displayName: 'ViewersData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired
	},

	getInitialState() {
		return {
			viewers: false,
			totalViewers: false,
			currentPage: false,
			fetchInitialized: false
		};
	},

	componentDidMount() {
		ViewersStore.on( 'change', this.refreshViewers );
		this.fetchIfEmpty( this.props.siteId );
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId ) {
			return;
		}
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( this.getInitialState() );
			this.fetchIfEmpty( nextProps.siteId );
		}
	},

	componentWillUnmount() {
		ViewersStore.removeListener( 'change', this.refreshViewers );
	},

	fetchIfEmpty( siteId ) {
		siteId = siteId || this.props.siteId;
		if ( ! siteId ) {
			return;
		}
		if ( ViewersStore.getViewers( siteId ).length ) {
			this.refreshViewers( siteId );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		const defer = function() {
			const paginationData = ViewersStore.getPaginationData( siteId );
			if ( paginationData.fetchingViewers ) {
				return;
			}
			ViewersActions.fetch( siteId );
			this.setState( { fetchInitialized: true } );
		}.bind( this );
		setTimeout( defer, 0 );
	},

	isFetching: function() {
		const siteId = this.props.siteId;
		if ( ! siteId ) {
			return true;
		}

		if ( ! this.state.viewers ) {
			return true;
		}

		const paginationData = ViewersStore.getPaginationData( siteId );

		if ( paginationData.fetchingViewers ) {
			return true;
		}
		return false;
	},

	refreshViewers( siteId ) {
		siteId = siteId || this.props.siteId;
		this.setState( {
			viewers: ViewersStore.getViewers( siteId ),
			totalViewers: ViewersStore.getPaginationData( siteId ).totalViewers,
			currentPage: ViewersStore.getPaginationData( siteId ).currentViewersPage
		} );
	},

	render() {
		return passToChildren( this, Object.assign( {}, this.state, { fetching: this.isFetching() } ) );
	}
} );
