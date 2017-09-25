/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal dependencies
 */
import StatsListItem from './stats-list-item';

const debug = debugFactory( 'calypso:stats:list' );

export default React.createClass( {
	displayName: 'StatsList',

	getInitialState: function() {
		return {
			activeGroups: []
		};
	},

	isGroupActive: function( groupName ) {
		return this.state.activeGroups.indexOf( groupName ) >= 0;
	},

	clickHandler: function( event, data ) {
		debug( 'clickHandler' );
		if ( 'function' === typeof this.props.clickHandler ) {
			this.props.clickHandler( event, data );
		}
	},

	buildLists: function( groups, parentKey ) {
		let results,
			listClass = classNames(
				'module-content-list',
				{
					'module-content-list-sublist': parentKey,
					'is-expanded': this.isGroupActive( parentKey )
				}
			);

		if ( groups ) {
			results = groups.map( function( group, groupIndex ) {
				let childResults,
					active,
					groupTree = parentKey ? [ parentKey ] : [],
					groupKey,
					clickHandler = this.props.clickHandler ? this.props.clickHandler : false;

				// Build a unique key for this group
				groupTree.push( groupIndex );
				groupKey = groupTree.join( ':' );

				// Determine if child data exists and setup css classes accoridingly
				active = this.isGroupActive( groupKey );

				// If this group has results, build up the nested child ul/li elements
				if ( group.children ) {
					childResults = this.buildLists( group.children, groupKey );
				}
				return <StatsListItem moduleName={ this.props.moduleName } data={ group } active={ active } children={ childResults } key={ groupKey } itemClickHandler={ clickHandler } followList={ this.props.followList } />;
			}, this );
		}

		return ( <ul className={ listClass }>{ results }</ul> );
	},

	render: function() {
		const list = this.buildLists( this.props.data );
		return ( list );
	}
} );
