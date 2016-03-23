/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

var SidebarFooter = require( 'layout/sidebar/footer' );

import ExternalLink from 'components/external-link';

export default React.createClass( {
	displayName: 'Sidebar',

	propTypes: {
		className: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	render: function() {
		return (
			<ul className={ classNames( 'sidebar', this.props.className ) } onClick={ this.props.onClick }>
				{ this.props.children }
				<SidebarFooter>
					<li><ExternalLink icon={ false } href="https://en.support.wordpress.com/" target="_blank">{ this.translate( 'Help' ) }</ExternalLink></li>
					<li><a href="#">{ this.translate( 'Support' ) }</a></li>
				</SidebarFooter>
			</ul>
		);
	}
} );
