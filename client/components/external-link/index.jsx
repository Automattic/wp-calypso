/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { assign, omit } from 'lodash';
import Gridicon from 'gridicons';
import { translate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

class ExternalLink extends Component {
	static defaultProps = {
		iconSize: 18,
		showIconFirst: false,
	};

	static propTypes = {
		className: PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		icon: PropTypes.bool,
		iconSize: PropTypes.number,
		target: PropTypes.string,
		showIconFirst: PropTypes.bool,
		iconClassName: PropTypes.string,
	};

	render() {
		const classes = classnames(
			'external-link',
			this.props.className,
			{
				'icon-first': !! this.props.showIconFirst,
			},
			{
				'has-icon': !! this.props.icon,
			}
		);
		const props = assign(
			{},
			omit( this.props, 'icon', 'iconSize', 'showIconFirst', 'iconClassName' ),
			{
				className: classes,
				rel: 'external',
			}
		);

		if ( this.props.icon ) {
			props.target = '_blank';
		}

		if ( props.target ) {
			props.rel = props.rel.concat( ' noopener noreferrer' );
		}

		const iconComponent = (
			<Gridicon
				className={ this.props.iconClassName }
				icon="external"
				size={ this.props.iconSize }
			/>
		);

		return (
			<a { ...props }>
				{ this.props.icon && this.props.showIconFirst && iconComponent }
				{ this.props.children }
				{ this.props.icon && ! this.props.showIconFirst && iconComponent }
				{ this.props.icon && (
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					<span className="screen-reader-text">
						{ /* translators: accessibility text */
						translate( '(opens in a new tab)' ) }
					</span>
				) }
			</a>
		);
	}
}
export default ExternalLink;
