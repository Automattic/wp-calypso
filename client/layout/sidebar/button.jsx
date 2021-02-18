/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { isExternal } from 'calypso/lib/url';
import { preload } from 'calypso/sections-helper';

class SidebarButton extends React.Component {
	static propTypes = {
		href: PropTypes.string,
		onClick: PropTypes.func,
		preloadSectionName: PropTypes.string,
		forceTargetInternal: PropTypes.bool,
	};

	static defaultProps = {
		forceTargetInternal: false,
	};

	_preloaded = false;

	preload = () => {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	};

	getTarget = () => {
		if ( this.props.forceTargetInternal ) {
			return null;
		}

		return isExternal( this.props.href ) ? '_blank' : null;
	};

	render() {
		if ( ! this.props.href ) {
			return null;
		}

		return (
			<a
				rel={ isExternal( this.props.href ) ? 'external' : null }
				onClick={ this.props.onClick }
				href={ this.props.href }
				target={ this.getTarget() }
				className="sidebar__button"
				onMouseEnter={ this.preload }
				data-tip-target={ this.props.tipTarget }
			>
				{ this.props.children || this.props.translate( 'Add' ) }
			</a>
		);
	}
}

export default localize( SidebarButton );
