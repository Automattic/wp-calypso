/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Focusable from 'components/focusable';
import Notice from 'components/notice';
import ScreenReaderText from 'components/screen-reader-text';
import Spinner from 'components/spinner';

class Task extends PureComponent {
	static propTypes = {
		buttonText: PropTypes.node,
		collapsed: PropTypes.bool,
		completed: PropTypes.bool,
		completedButtonText: PropTypes.node,
		completedTitle: PropTypes.node,
		description: PropTypes.node,
		disableIcon: PropTypes.bool,
		duration: PropTypes.string,
		href: PropTypes.string,
		inProgress: PropTypes.bool,
		isWarning: PropTypes.bool,
		onClick: PropTypes.func,
		onTaskClick: PropTypes.func,
		onDismiss: PropTypes.func,
		target: PropTypes.string,
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
		trackTaskDisplay: PropTypes.func,
		showSkip: PropTypes.bool,
	};

	static defaultProps = {
		trackTaskDisplay: () => {},
	};

	componentDidMount() {
		this.props.trackTaskDisplay( this.props.id, this.props.completed, 'checklist' );
	}

	renderCheckmarkIcon() {
		const { completed, disableIcon, inProgress, isWarning, translate } = this.props;
		const onDismiss = ! completed ? this.props.onDismiss : undefined;

		if ( inProgress ) {
			return (
				<Fragment>
					<ScreenReaderText>{ translate( 'In progress' ) }</ScreenReaderText>
					{ this.renderGridicon() }
				</Fragment>
			);
		}

		if ( disableIcon ) {
			return (
				<div className="checklist__task-icon is-disabled">
					<ScreenReaderText>{ translate( 'Waiting to complete' ) }</ScreenReaderText>
				</div>
			);
		}

		if ( onDismiss ) {
			return (
				<Focusable
					className="checklist__task-icon"
					onClick={ onDismiss }
					aria-pressed={ completed ? 'true' : 'false' }
				>
					<ScreenReaderText>
						{ completed ? translate( 'Mark as uncompleted' ) : translate( 'Mark as completed' ) }
					</ScreenReaderText>
					{ this.renderGridicon() }
				</Focusable>
			);
		}

		if ( completed ) {
			return (
				<div className="checklist__task-icon">
					<ScreenReaderText>{ translate( 'Complete' ) }</ScreenReaderText>
					{ this.renderGridicon() }
				</div>
			);
		}

		if ( isWarning ) {
			return (
				<div>
					<ScreenReaderText>{ translate( 'Warning' ) }</ScreenReaderText>
					{ this.renderGridicon() }
				</div>
			);
		}

		return null;
	}

	renderGridicon() {
		if ( this.props.inProgress ) {
			return <Spinner size={ 20 } />;
		}

		if ( this.props.isWarning ) {
			return (
				<div>
					<div className="checklist__task-warning-background" />
					<Gridicon icon={ 'notice-outline' } size={ 24 } />
				</div>
			);
		}

		return <Gridicon icon={ 'checkmark' } size={ 18 } />;
	}

	render() {
		const {
			buttonText,
			collapsed,
			completed,
			completedButtonText,
			completedTitle,
			description,
			duration,
			href,
			isBlockedLaunchSiteTask,
			inProgress,
			isWarning,
			onClick,
			target,
			title,
			translate,
			onDismiss,
			showSkip,
		} = this.props;

		// A task that's being automatically completed ("in progress") cannot be expanded.
		// An uncompleted task by definition has a call-to-action, which can only be accessed by
		// expanding it, so an uncompleted task is always expandable.
		// A completed task may or may not have a call-to-action, which can be best inferred from
		// the `completedButtonText` prop.
		const isExpandable = ! inProgress && ( ! completed || completedButtonText );
		const taskActionButtonText = completed
			? completedButtonText
			: buttonText || translate( 'Try it' );

		return (
			<CompactCard
				className={ classNames( 'checklist__task', {
					warning: isWarning,
					'is-completed': completed,
					'is-in-progress': inProgress,
					'is-unexpandable': ! isExpandable,
					'is-collapsed': collapsed,
				} ) }
			>
				<div className="checklist__task-wrapper">
					<h3 className="checklist__task-title">
						{ isExpandable ? (
							<Button
								borderless
								className="checklist__task-title-button"
								onClick={ this.props.onTaskClick }
							>
								{ completed ? completedTitle : title }
								<Gridicon icon="chevron-up" className="checklist__toggle-icon" />
							</Button>
						) : (
							completedTitle
						) }
					</h3>

					{ ! collapsed && (
						<div className="checklist__task-content">
							<p className="checklist__task-description">{ description }</p>

							<div className="checklist__task-action-duration-wrapper">
								{ duration && (
									<small className="checklist__task-duration">
										{ translate( 'Estimated time:' ) } { duration }
									</small>
								) }

								<div className="checklist__task-action-wrapper">
									<Button
										className="checklist__task-action"
										disabled={ isBlockedLaunchSiteTask }
										href={ href }
										onClick={ onClick }
										primary={ ! collapsed }
										target={ target }
									>
										{ taskActionButtonText }
									</Button>
									{ ! completed && showSkip && (
										<Button className="checklist__task-skip" onClick={ onDismiss }>
											{ translate( 'Skip' ) }
										</Button>
									) }
									{ isBlockedLaunchSiteTask && (
										<Notice
											className="checklist__task-launch-site-blocked-notice"
											showDismiss={ false }
										>
											{ translate( 'Confirm your email address before launching your site.' ) }
										</Notice>
									) }
								</div>
							</div>
						</div>
					) }
				</div>

				{ this.renderCheckmarkIcon() }
			</CompactCard>
		);
	}
}

export default connect( ( state, { completed, disableIcon, id } ) => {
	const isBlockedLaunchSiteTask =
		'site_launched' === id && ! completed && ! isCurrentUserEmailVerified( state );
	return {
		disableIcon: isBlockedLaunchSiteTask || disableIcon,
		isBlockedLaunchSiteTask,
	};
} )( localize( Task ) );
