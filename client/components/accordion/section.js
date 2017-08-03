/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {
	render() {
		return (
			<section className={ classNames( 'accordion__section', this.props.className ) } >
				{ this.props.children }
			</section>
		);
	},
} );
