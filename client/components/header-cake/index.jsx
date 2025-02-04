import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import HeaderCakeBack from './back';

import './style.scss';

export default class HeaderCake extends Component {
	render() {
		const {
			backText,
			backHref,
			backIcon,
			actionButton,
			actionText,
			actionIcon,
			actionHref,
			actionOnClick,
			alwaysShowActionText,
			alwaysShowBackText,
		} = this.props;
		const classes = clsx( 'header-cake', this.props.className, {
			'is-compact': this.props.isCompact,
		} );

		const hasBackButton = !! backHref || !! this.props.onClick;

		return (
			<Card className={ classes }>
				{ hasBackButton && (
					<HeaderCakeBack
						text={ backText }
						href={ backHref }
						icon={ backIcon }
						onClick={ this.props.onClick }
						alwaysShowActionText={ alwaysShowBackText }
					/>
				) }

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
	backIcon: PropTypes.string,
	actionButton: PropTypes.element,
	actionText: PropTypes.string,
	actionHref: PropTypes.string,
	actionIcon: PropTypes.string,
	actionOnClick: PropTypes.func,
	alwaysShowActionText: PropTypes.bool,
	alwaysShowBackText: PropTypes.bool,
};

HeaderCake.defaultProps = {
	isCompact: false,
	alwaysShowActionText: false,
	alwaysShowBackText: false,
};
