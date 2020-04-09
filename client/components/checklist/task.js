/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, CompactCard, ScreenReaderText } from '@automattic/components';
import Notice from 'components/notice';
import Spinner from 'components/spinner';

class Task extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
		buttonText: PropTypes.node,
		collapsed: PropTypes.bool, // derived from ui state
		completed: PropTypes.bool,
		completedButtonText: PropTypes.node,
		completedTitle: PropTypes.node,
		description: PropTypes.node,
		disableIcon: PropTypes.bool,
		duration: PropTypes.string,
		forceCollapsed: PropTypes.bool, // derived from API state
		href: PropTypes.string,
		inProgress: PropTypes.bool,
		isButtonDisabled: PropTypes.bool,
		isWarning: PropTypes.bool,
		noticeText: PropTypes.string,
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
				<div className="checklist__task-icon">
					<ScreenReaderText>
						{ completed ? translate( 'Mark as uncompleted' ) : translate( 'Mark as completed' ) }
					</ScreenReaderText>
					{ this.renderGridicon() }
				</div>
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
			action,
			buttonText,
			collapsed,
			completed,
			completedDescription,
			completedButtonText,
			completedTitle,
			description,
			duration,
			forceCollapsed,
			href,
			isButtonDisabled,
			inProgress,
			isWarning,
			noticeText,
			onClick,
			target,
			title,
			translate,
			onDismiss,
			showSkip,
		} = this.props;

		const _collapsed = forceCollapsed || collapsed;

		// A task that's being automatically completed ("in progress") cannot be expanded.
		// An uncompleted task by definition has a call-to-action, which can only be accessed by
		// expanding it, so an uncompleted task is always expandable.
		// A completed task may or may not have a call-to-action, which can be best inferred from
		// the `completedButtonText` prop.
		const isExpandable =
			! forceCollapsed || ( ! inProgress && ( ! completed || completedButtonText ) );
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
					'is-collapsed': _collapsed,
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

					{ ! _collapsed && (
						<div className="checklist__task-content">
							<p className="checklist__task-description">
								{ completed && completedDescription ? completedDescription : description }
							</p>

							<div className="checklist__task-action-duration-wrapper">
								{ ! completed && duration && (
									<small className="checklist__task-duration">
										{ translate( 'Estimated time:' ) } { duration }
									</small>
								) }

								<div className="checklist__task-action-wrapper">
									{ !! taskActionButtonText && (
										<Button
											className="checklist__task-action"
											disabled={ isButtonDisabled }
											href={ href }
											onClick={ onClick }
											primary={ ! _collapsed }
											target={ target }
											data-e2e-action={ action }
										>
											{ taskActionButtonText }
										</Button>
									) }
									{ ! completed && showSkip && (
										<Button className="checklist__task-skip" borderless onClick={ onDismiss }>
											{ translate( 'Skip' ) }
										</Button>
									) }
									{ !! noticeText && (
										<Notice className="checklist__task-notice" showDismiss={ false }>
											{ noticeText }
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

export default localize( Task );
