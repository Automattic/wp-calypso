/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

export class SidebarBanner extends Component {
	static defaultProps = {
		className: '',
		icon: null,
		text: null,
	};

	static propTypes = {
		className: PropTypes.string,
		icon: PropTypes.string,
		onDismissClick: PropTypes.func,
		text: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ) ),
			PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		] ),
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { children, className, icon, text } = this.props;
		const classes = classnames( 'sidebar-banner', className );

		return (
			<div className={ classes }>
				<span className="sidebar-banner__icon-wrapper">
					<Gridicon className="sidebar-banner__icon" icon={ icon } size={ 18 } />
				</span>
				<span className="sidebar-banner__content">
					<span className="sidebar-banner__text">{ text ? text : children }</span>
				</span>
				{ text ? children : null }
			</div>
		);
	}
}

export default localize( SidebarBanner );
