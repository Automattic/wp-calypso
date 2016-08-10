import React from 'react';
import {
	compose,
	concat,
	partition,
	prop,
	propEq
} from 'ramda';

const groupFilter = compose( prop( 'filter' ), prop( 'props' ) );
const hasMatches = a => a.length > 1;
const isGroupHeader = compose( propEq( 'displayName', 'GroupHeader' ), prop( 'type' ) );
const toFilteredGroups = ( [ groupList, remainingChildren ], nextGroup ) => {
	const [ matched, notMatched ] = partition( groupFilter( nextGroup ), remainingChildren );

	return [ [ ...groupList, [ nextGroup, ...matched ] ], notMatched ];
};

export const GroupedList = React.createClass( {
	getInitialState() {
		return { items: [] };
	},

	componentWillMount() {
		this.updateItems( this.props.children );
	},

	componentWillReceiveProps( { children } ) {
		this.updateItems( children );
	},

	updateItems( allChildren ) {
		const [
			groupHeaders,
			children
		] = partition( isGroupHeader, React.Children.toArray( allChildren ) );

		const items = groupHeaders
			.reduce( toFilteredGroups, [ [], children ] )
			.shift()
			.filter( hasMatches )
			.reduce( concat, [] );

		this.setState( { items } );
	},

	render() {
		const { items } = this.state;

		return (
			<div>
				{ items }
			</div>
		);
	}
} );

export const GroupHeader = React.createClass( {
	render() {
		const { children } = this.props;

		return <div className="notifications__list-group">{ children }</div>;
	}
} );

GroupHeader.displayName = 'GroupHeader';

export default GroupedList;
