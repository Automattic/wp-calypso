/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'NoticeAction',

	propTypes: {
		href: React.PropTypes.string,
		target: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	render() {
		return (
			<a className="notice__action" { ...this.props }>
				<span>{ this.props.children }</span>
				<Gridicon icon="arrow-right" size={ 24 } />
			</a>
		);
	}
} );
