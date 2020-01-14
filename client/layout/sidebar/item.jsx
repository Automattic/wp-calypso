/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Gridicon } from '@automattic/components';
import { isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import { isExternal } from 'lib/url';
import MaterialIcon from 'components/material-icon';
import { preload } from 'sections-helper';
import TranslatableString from 'components/translatable/proptype';

export default class SidebarItem extends React.Component {
	static propTypes = {
		label: TranslatableString.isRequired,
		className: PropTypes.string,
		link: PropTypes.string.isRequired,
		onNavigate: PropTypes.func,
		icon: PropTypes.string,
		customIcon: PropTypes.object,
		materialIcon: PropTypes.string,
		selected: PropTypes.bool,
		expandSection: PropTypes.func,
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

	componentDidMount() {
		const { expandSection, selected } = this.props;

		if ( isFunction( expandSection ) && selected ) {
			expandSection();
		}
	}

	render() {
		const isExternalLink = isExternal( this.props.link );
		const showAsExternal = isExternalLink && ! this.props.forceInternalLink;
		const classes = classnames( this.props.className, { selected: this.props.selected } );
		const { materialIcon, icon, customIcon } = this.props;

		return (
			<li
				className={ classes }
				data-tip-target={ this.props.tipTarget }
				data-post-type={ this.props.postType }
			>
				<a
					className="sidebar__menu-link"
					onClick={ this.props.onNavigate }
					href={ this.props.link }
					target={ showAsExternal ? '_blank' : null }
					rel={ isExternalLink ? 'noopener noreferrer' : null }
					onMouseEnter={ this.preload }
				>
					{ icon && <Gridicon className={ 'sidebar__menu-icon' } icon={ icon } size={ 24 } /> }

					{ materialIcon && (
						<MaterialIcon className={ 'sidebar__menu-icon' } icon={ materialIcon } />
					) }

					{ customIcon && customIcon }

					{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
					<span
						className="sidebar__menu-link-text menu-link-text"
						data-e2e-sidebar={ this.props.label }
					>
						{ this.props.label }
					</span>
					{ showAsExternal && <Gridicon icon="external" size={ 24 } /> }
					{ this.props.children }
				</a>
			</li>
		);
	}
}
