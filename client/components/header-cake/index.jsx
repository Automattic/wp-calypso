/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import HeaderCakeBack from './back';

/**
 * Style dependencies
 */
import './style.scss';

export default class HeaderCake extends Component {
	render() {
		const {
			backText,
			backHref,
			actionButton,
			actionText,
			actionIcon,
			actionHref,
			actionOnClick,
			alwaysShowActionText,
		} = this.props;
		const classes = classNames( 'header-cake', this.props.className, {
			'is-compact': this.props.isCompact,
		} );

		return (
			<Card className={ classes }>
				<HeaderCakeBack text={ backText } href={ backHref } onClick={ this.props.onClick } />

				<div className="header-cake__title" role="presentation" onClick={ this.props.onTitleClick }>
					{ this.props.children }
				</div>

				{ actionButton || (
					<HeaderCakeBack
						text={ actionText || backText }
						href={ actionHref || backHref }
						onClick={ actionOnClick }
						icon={ actionIcon }
						alwaysShowActionText={ alwaysShowActionText }
						spacer={ ! actionOnClick }
					/>
				) }
			</Card>
		);
	}
}

HeaderCake.displayName = 'HeaderCake';

HeaderCake.propTypes = {
	onClick: PropTypes.func,
	onTitleClick: PropTypes.func,
	backText: PropTypes.string,
	backHref: PropTypes.string,
	actionButton: PropTypes.element,
	actionText: PropTypes.string,
	actionHref: PropTypes.string,
	actionIcon: PropTypes.string,
	actionOnClick: PropTypes.func,
	alwaysShowActionText: PropTypes.bool,
};

HeaderCake.defaultProps = {
	isCompact: false,
	alwaysShowActionText: false,
};
