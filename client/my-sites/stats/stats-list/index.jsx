/**
 * External dependencies
 */

import React from 'react';
import classNames from 'classnames';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:stats:list' );

/**
 * Internal dependencies
 */
import StatsListItem from './stats-list-item';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'StatsList';

	state = {
		activeGroups: [],
	};

	isGroupActive = ( groupName ) => {
		return this.state.activeGroups.indexOf( groupName ) >= 0;
	};

	clickHandler = ( event, data ) => {
		debug( 'clickHandler' );
		if ( 'function' === typeof this.props.clickHandler ) {
			this.props.clickHandler( event, data );
		}
	};

	buildLists = ( groups, parentKey ) => {
		let results;
		const listClass = classNames( 'module-content-list', {
			'module-content-list-sublist': parentKey,
			'is-expanded': this.isGroupActive( parentKey ),
		} );

		if ( groups ) {
			results = groups.map( function ( group, groupIndex ) {
				let childResults;
				const groupTree = parentKey ? [ parentKey ] : [];

				const clickHandler = this.props.clickHandler ? this.props.clickHandler : false;

				// Build a unique key for this group
				groupTree.push( groupIndex );
				const groupKey = groupTree.join( ':' );

				// Determine if child data exists and setup css classes accoridingly
				const active = this.isGroupActive( groupKey );

				// If this group has results, build up the nested child ul/li elements
				if ( group.children ) {
					childResults = this.buildLists( group.children, groupKey );
				}
				return (
					<StatsListItem
						moduleName={ this.props.moduleName }
						data={ group }
						active={ active }
						children={ childResults }
						key={ groupKey }
						itemClickHandler={ clickHandler }
						followList={ this.props.followList }
						useShortLabel={ this.props.useShortLabel }
					/>
				);
			}, this );
		}

		return <ul className={ listClass }>{ results }</ul>;
	};

	render() {
		const list = this.buildLists( this.props.data );
		return list;
	}
}
