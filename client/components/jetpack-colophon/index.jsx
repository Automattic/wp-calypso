/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo'

export default React.createClass( {
	displayName: 'JetpackColophon',

	propTypes: {
		className: React.PropTypes.string,
	},

	render: function() {
		const className = classNames( 'jetpack-colophon', this.props.className );

		return (
			<div className={ className }>
				<span className="jetpack-colophon__power">Powered by </span><JetpackLogo size={ 24 } full />
			</div>
		);
	}
} );
