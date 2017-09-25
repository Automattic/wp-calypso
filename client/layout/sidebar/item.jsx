/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import { preload } from 'sections-preload';

export default React.createClass( {
	displayName: 'SidebarItem',

	propTypes: {
		label: PropTypes.string.isRequired,
		className: PropTypes.string,
		link: PropTypes.string.isRequired,
		onNavigate: PropTypes.func,
		icon: PropTypes.string,
		selected: PropTypes.bool,
		preloadSectionName: PropTypes.string,
		forceInternalLink: PropTypes.bool,
		testTarget: PropTypes.string,
		tipTarget: PropTypes.string
	},

	_preloaded: false,

	preload() {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	},

	render() {
		const isExternalLink = isExternal( this.props.link );
		const showAsExternal = isExternalLink && ! this.props.forceInternalLink;
		const classes = classnames( this.props.className, { selected: this.props.selected } );

		return (
			<li
				className={ classes }
				data-tip-target={ this.props.tipTarget }
				data-post-type={ this.props.postType }
			>
				<a
					onClick={ this.props.onNavigate }
					href={ this.props.link }
					target={ showAsExternal ? '_blank' : null }
					rel={ isExternalLink ? 'noopener noreferrer' : null }
					onMouseEnter={ this.preload }
				>
					<Gridicon icon={ this.props.icon } size={ 24 } />
					<span className="menu-link-text">{ this.props.label }</span>
					{ showAsExternal && <Gridicon icon="external" size={ 24 } /> }
				</a>
				{ this.props.children }
			</li>
		);
	}
} );
