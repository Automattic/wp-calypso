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
		const wrapperClassName = this.props.isWide ? 'jetpack-connect__main-wide' : 'jetpack-connect__main';
		return (
			<Main className={ classNames( this.props.className, wrapperClassName ) }>
				{ this.props.children }
			</Main>
		);
	}
} );
