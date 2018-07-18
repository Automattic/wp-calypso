/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import { preload } from 'sections-helper';
import TranslatableString from 'components/translatable/proptype';
import compareProps from 'lib/compare-props';

export default class SidebarItem extends React.Component {
	static propTypes = {
		label: TranslatableString.isRequired,
		className: PropTypes.string,
		link: PropTypes.string.isRequired,
		onNavigate: PropTypes.func,
		icon: PropTypes.string,
		selected: PropTypes.bool,
		preloadSectionName: PropTypes.string,
		forceInternalLink: PropTypes.bool,
		testTarget: PropTypes.string,
		tipTarget: PropTypes.string,
	};

	_preloaded = false;

	preload = () => {
		if ( ! this._preloaded && this.props.preloadSectionName ) {
			this._preloaded = true;
			preload( this.props.preloadSectionName );
		}
	};

	shouldSkipRender = compareProps( { ignore: [ 'onNavigate' ] } );
	shouldComponentUpdate( nextProps ) {
		return ! this.shouldSkipRender( this.props, nextProps );
	}

	onNavigate = e => {
		return this.props.onNavigate( e );
	};

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
					onClick={ this.onNavigate }
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
}
