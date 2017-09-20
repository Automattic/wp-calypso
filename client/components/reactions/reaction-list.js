/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { reactionsData } from './constants';
import ReactionListItem from './reaction-list-item';

export default function ReactionList( props ) {
	return (
		<ul className="reactions__list">{
			reactionsData.map( ( item ) => (
				<ReactionListItem
					icon={ item.icon }
					slug={ item.slug }
					onSelected={ props.onSelected }
				/>
			) )
		}</ul>
	);
}
