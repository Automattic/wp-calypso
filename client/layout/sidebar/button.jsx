/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import { preload } from 'sections-preload';

export default React.createClass( {
	displayName: 'SidebarButton',

	propTypes: {
		href: PropTypes.string,
		onClick: PropTypes.func,
		preloadSectionName: PropTypes.string,
		children: PropTypes.node
	},

	_preloaded: false,

	preload() {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	},

	render() {
		if ( ! this.props.href ) {
			return null;
		}

		return (
			<a
				rel={ isExternal( this.props.href ) ? 'external' : null }
				onClick={ this.props.onClick }
				href={ this.props.href }
				target={ isExternal( this.props.href ) ? '_blank' : null }
				className="sidebar__button"
				onMouseEnter={ this.preload }
				data-tip-target={ this.props.tipTarget }
			>
				{ this.props.children || this.translate( 'Add' ) }
			</a>
		);
	}
} );
