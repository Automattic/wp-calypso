/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import Gridicon from 'components/gridicon';
import sections from 'sections';

export default React.createClass( {
	displayName: 'SidebarItem',

	propTypes: {
		label: React.PropTypes.string.isRequired,
		className: React.PropTypes.string,
		link: React.PropTypes.string.isRequired,
		buttonLink: React.PropTypes.string,
		buttonLabel: React.PropTypes.string,
		onNavigate: React.PropTypes.func,
		icon: React.PropTypes.string,
		selected: React.PropTypes.bool,
		preloadSectionName: React.PropTypes.string
	},

	_preloaded: false,

	renderButton( link ) {
		if ( ! link ) {
			return null;
		}

		return (
			<a
				rel={ isExternal( link ) ? 'external' : null }
				onClick={ this.props.onNavigate }
				href={ link }
				target={ isExternal( link ) ? '_blank' : null }
				className="add-new">
				{ this.props.buttonLabel || this.translate( 'Add' ) }
			</a>
		);
	},

	preload() {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			sections.preload( this.props.preloadSectionName );
		}
	},

	render() {
		const isExternalLink = isExternal( this.props.link );
		const classes = classnames( this.props.className, { selected: this.props.selected } );

		return (
			<li className={ classes }>
				<a
					onClick={ this.props.onNavigate }
					href={ this.props.link }
					target={ isExternalLink ? '_blank' : null }
					onMouseEnter={ this.preload }
				>
					<Gridicon icon={ this.props.icon } size={ 24 } />
					<span className="menu-link-text">{ this.props.label }</span>
					{ isExternalLink ? <span className="noticon noticon-external" /> : null }
				</a>
				{ this.renderButton( this.props.buttonLink ) }
			</li>
		);
	}
} );
