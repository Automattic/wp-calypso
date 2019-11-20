/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Notice from 'components/notice';
import ScreenReaderText from 'components/screen-reader-text';

class Task extends PureComponent {
	static propTypes = {
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
		const { completed, translate } = this.props;

		if ( completed ) {
			return (
				<div className="checklist__task-icon">
					<ScreenReaderText>{ translate( 'Complete' ) }</ScreenReaderText>
					<Gridicon icon={ 'checkmark' } size={ 18 } />
				</div>
			);
		}

		return null;
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
							<p className="checklist__task-description">{ description }</p>

							<div className="checklist__task-action-duration-wrapper">
								{ duration && (
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
										>
											{ taskActionButtonText }
										</Button>
									) }
									{ ! completed && showSkip && (
										<Button className="checklist__task-skip" onClick={ onDismiss }>
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
