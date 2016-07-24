/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';

export default React.createClass( {
	displayName: 'JetpackConnectMainWrapper',

	render() {
		return (
			<Main className={ classNames( this.props.className, 'jetpack-connect__main' ) }>
				{ this.props.children }
			</Main>
		);
	}
} );
