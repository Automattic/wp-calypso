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

	propTypes: {
		isWide: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			isWide: false
		};
	},

	render() {
		const wrapperClassName = classNames( 'jetpack-connect__main', {
			'is-wide': this.props.isWide
		} );
		return (
			<Main className={ classNames( this.props.className, wrapperClassName ) }>
				{ this.props.children }
			</Main>
		);
	}
} );
