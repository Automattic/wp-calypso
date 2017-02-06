/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import HeaderCakeBack from './back';

export default class HeaderCake extends Component {
	render() {
		const { backText, backHref, actionText, actionIcon, actionHref, actionOnClick } = this.props;
		const classes = classNames(
			'header-cake',
			this.props.className,
			{ 'is-compact': this.props.isCompact }
		);

		return (
			<Card className={ classes }>
				<HeaderCakeBack
					text={ backText }
					href={ backHref }
					onClick={ this.props.onClick }
				/>

				<div
					className="header-cake__title"
					onClick={ this.props.onTitleClick }
				>
					{ this.props.children }
				</div>

				<HeaderCakeBack
					text={ actionText || backText }
					href={ actionHref || backHref }
					onClick={ actionOnClick }
					icon={ actionIcon }
					spacer={ ! actionOnClick } />
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
	actionText: PropTypes.string,
	actionHref: PropTypes.string,
	actionIcon: PropTypes.string,
	actionOnClick: PropTypes.func,
};

HeaderCake.defaultProps = {
	isCompact: false
};
