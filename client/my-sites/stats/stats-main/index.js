/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect }	from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { shouldViewBeVisible } from 'state/first-view/selectors';

const StatsMain = React.createClass( {
	displayName: 'StatsMain',

	render: function() {
		const classes = classnames( {
			'is-first-view-visible': this.props.isFirstViewVisible
		} );

		return (
			<Main className={ classes }>
				{ this.props.children }
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			isFirstViewVisible: shouldViewBeVisible( state ),
		};
	},
	null
)( StatsMain );
