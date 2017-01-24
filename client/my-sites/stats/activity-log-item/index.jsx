/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import FoldableCard from 'components/foldable-card';
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import Gravatar from 'components/gravatar';

class ActivityLogItem extends Component {

	static propTypes = {
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.number.isRequired,
		requestRestore: PropTypes.func,
		title: PropTypes.string,
		subTitle: PropTypes.string,
		className: PropTypes.string,
		icon: PropTypes.string,
		status: PropTypes.oneOf( [ 'is-success', 'is-warning', 'is-error', 'is-info' ] ),
		user: PropTypes.object,
		onClick: PropTypes.func,
		actionText: PropTypes.string,
		description: PropTypes.string,
	};

	static defaultProps = {
		onClick: noop,
		status: 'is-info',
		icon: 'info-outline',
	};

	getTime() {
		const {
			moment,
			timestamp
		} = this.props;

		return (
			<div className="activity-log-item__time">
				{ moment( timestamp ).format( 'LT' ) }
			</div>
		);
	}

	getIcon() {
		const {
			icon,
			status
		} = this.props;

		const classes = classNames(
			'activity-log-item__icon',
			status
		);

		return (
			<div className={ classes }>
				<Gridicon icon={ icon } size={ 24 } />
			</div>
		);
	}

	getActor() {
		const {
			user
		} = this.props;

		if ( ! user ) {
			return null;
		}

		return (
			<div className="activity-log-item__actor">
				<Gravatar user={ user } size={ 48 } />
				<div className="activity-log-item__actor-info">
					<div className="activity-log-item__actor-name">{ user.name }</div>
					<div className="activity-log-item__actor-role">{ user.role }</div>
				</div>
			</div>
		);
	}

	getContent() {
		const {
			title,
			subTitle
		} = this.props;

		return (
			<div className="activity-log-item__content">
				<div className="activity-log-item__content-title">{ title }</div>
				{ subTitle && <div className="activity-log-item__content-sub-title">{ subTitle }</div> }
			</div>
		);
	}

	getSummary() {
		const {
			translate,
			onClick,
			actionText
		} = this.props;

		return ( actionText &&
			<div className="activity-log-item__action">
				<EllipsisMenu position="bottom right">
					<PopoverMenuItem onClick={ onClick } icon="undo">{ actionText }</PopoverMenuItem>
					<PopoverMenuItem icon="pencil">Option B</PopoverMenuItem>
					<PopoverMenuSeparator />
					<PopoverMenuItem icon="help">{ translate( 'More Info' ) }</PopoverMenuItem>
				</EllipsisMenu>
			</div>
		);
	}

	getHeader() {
		return (
			<div className="activity-log-item__card-header">
				{ this.getActor() }
				{ this.getContent() }
			</div>
		);
	}

	render() {
		const {
			className,
			description
		} = this.props;

		const classes = classNames(
			'activity-log-item',
			className
		);
		return (
			<div className={ classes } >
				<div className="activity-log-item__type">
					{ this.getTime() }
					{ this.getIcon() }
				</div>
				<FoldableCard
					className="activity-log-item__card"
					header={ this.getHeader() }
					summary={ this.getSummary() }
					expandedSummary={ this.getSummary() }
					clickableHeader={ true }
				>
					{ description }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( ActivityLogItem );
