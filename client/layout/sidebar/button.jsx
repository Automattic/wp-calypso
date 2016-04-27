/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import { preload } from 'sections-preload';

export default React.createClass( {
	displayName: 'SidebarButton',

	propTypes: {
		href: React.PropTypes.string.isRequired,
		onClick: React.PropTypes.func,
		preloadSectionName: React.PropTypes.string
	},

	_preloaded: false,

	preload() {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	},

	render() {
		return (
			<a
				rel={ isExternal( this.props.href ) && 'external' }
				onClick={ this.props.onClick }
				href={ this.props.href }
				target={ isExternal( this.props.href ) && '_blank' }
				className="sidebar__button"
			>
				{ this.props.children || this.translate( 'Add' ) }
			</a>
		);
	}
} );
