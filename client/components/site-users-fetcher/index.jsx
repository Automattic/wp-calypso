/** @format */

/**
 * External dependencies
 */

import { includes, isEqual, omit, partition } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:site-users-fetcher' );

/**
 * Internal dependencies
 */
import UsersStore from 'lib/users/store';
import UsersActions from 'lib/users/actions';
import pollers from 'lib/data-poller';

/**
 * Module variables
 */
var defaultOptions = {
	number: 100,
	offset: 0,
};

export default class extends React.Component {
	static displayName = 'SiteUsersFetcher';

	static propTypes = {
		fetchOptions: PropTypes.object.isRequired,
		exclude: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.number ), PropTypes.func ] ),
	};

	componentWillMount() {
		debug( 'Mounting SiteUsersFetcher' );
		UsersStore.on( 'change', this._updateSiteUsers );
		this._fetchIfEmpty();
		this._poller = pollers.add(
			UsersStore,
			UsersActions.fetchUpdated.bind( UsersActions, this.props.fetchOptions, true ),
			{ leading: false }
		);
	}

	componentWillUnmount() {
		UsersStore.off( 'change', this._updateSiteUsers );
		pollers.remove( this._poller );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.fetchOptions ) {
			return;
		}
		if ( ! isEqual( this.props.fetchOptions, nextProps.fetchOptions ) ) {
			this._updateSiteUsers( nextProps.fetchOptions );
			this._fetchIfEmpty( nextProps.fetchOptions );
			pollers.remove( this._poller );
			this._poller = pollers.add(
				UsersStore,
				UsersActions.fetchUpdated.bind( UsersActions, nextProps.fetchOptions, true ),
				{ leading: false }
			);
		}
	}

	render() {
		var childrenProps = Object.assign( omit( this.props, 'children' ), this.state );
		// Clone the child element along and pass along state (containing data from the store)
		return React.cloneElement( this.props.children, childrenProps );
	}

	_updateSiteUsers = fetchOptions => {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		this.setState( this._getState( fetchOptions ) );
	};

	_getState = fetchOptions => {
		var paginationData, users;
		fetchOptions = fetchOptions || this.props.fetchOptions;
		fetchOptions = Object.assign( {}, defaultOptions, fetchOptions );
		paginationData = UsersStore.getPaginationData( fetchOptions );
		users = UsersStore.getUsers( fetchOptions );

		if ( this.props.exclude ) {
			// Partition will return an array of two arrays.
			// users[0] will be a list of the users that were not excluded.
			// users[1] will be a list of the excluded users.
			users = partition(
				users,
				function( user ) {
					if ( 'function' === typeof this.props.exclude ) {
						return ! this.props.exclude( user );
					}

					return ! includes( this.props.exclude, user.ID );
				}.bind( this )
			);
		}

		return Object.assign( {}, paginationData, {
			users: this.props.exclude ? users[ 0 ] : users,
			fetchOptions: fetchOptions,
			excludedUsers: this.props.exclude ? users[ 1 ] : [],
		} );
	};

	_fetchIfEmpty = fetchOptions => {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		if ( ! fetchOptions || ! fetchOptions.siteId ) {
			return;
		}
		fetchOptions = Object.assign( {}, defaultOptions, fetchOptions );
		if ( UsersStore.getUsers( fetchOptions ).length ) {
			debug( 'initial fetch not necessary' );
			return;
		}
		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( function() {
			var paginationData = UsersStore.getPaginationData( fetchOptions );
			if ( paginationData.fetchingUsers ) {
				return;
			}
			UsersActions.fetchUsers( fetchOptions );
		}, 0 );
	};

	state = this._getState();
}
