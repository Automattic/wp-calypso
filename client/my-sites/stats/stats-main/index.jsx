/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { shouldViewBeVisible } from 'state/ui/first-view/selectors';

const StatsMain = ( { isFirstViewVisible, children } ) => {
	const classes = classnames( {
		'is-first-view-visible': isFirstViewVisible
	} );

	return (
		<Main className={ classes }>
			{ children }
		</Main>
	);
};

export default connect(
	( state ) => {
		return {
			isFirstViewVisible: shouldViewBeVisible( state ),
		};
	},
	null
)( StatsMain );
