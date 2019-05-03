/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Focusable from 'components/focusable';
import ScreenReaderText from 'components/screen-reader-text';
import Spinner from 'components/spinner';

class Task extends PureComponent {
	static propTypes = {
		buttonPrimary: PropTypes.bool,
		buttonText: PropTypes.node,
		completed: PropTypes.bool,
		completedButtonText: PropTypes.node,
		completedDescription: PropTypes.node,
		completedTitle: PropTypes.node,
		description: PropTypes.node,
		duration: PropTypes.string,
		href: PropTypes.string,
		inProgress: PropTypes.bool,
		isWarning: PropTypes.bool,
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		target: PropTypes.string,
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
		trackTaskDisplay: PropTypes.func,
	};

	static defaultProps = {
		trackTaskDisplay: () => {},
	};

	componentDidMount() {
		this.props.trackTaskDisplay( this.props.id, this.props.completed, 'checklist' );
	}

	renderCheckmarkIcon() {
		const { completed, inProgress, isWarning, translate } = this.props;
		const onDismiss = ! completed ? this.props.onDismiss : undefined;

		if ( inProgress ) {
			return (
				<Fragment>
					<ScreenReaderText>{ translate( 'In progress' ) }</ScreenReaderText>
					{ this.renderGridicon() }
				</Fragment>
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
			buttonPrimary,
			completed,
			completedButtonText,
			completedDescription,
			completedTitle,
			description,
			duration,
			href,
			inProgress,
			isWarning,
			onClick,
			target,
			title,
			translate,
			firstIncomplete,
		} = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;
		const hasActionlink = completed && completedButtonText;
		const isCollapsed = firstIncomplete && firstIncomplete.id !== this.props.id;

		return (
			<CompactCard
				className={ classNames( 'checklist__task', {
					warning: isWarning,
					'is-completed': completed,
					'is-in-progress': inProgress,
					'has-actionlink': hasActionlink,
					'is-collapsed': isCollapsed,
				} ) }
			>
				<div className="checklist__task-primary">
					<h3 className="checklist__task-title">
						<Button
							borderless
							className="checklist__task-title-link"
							href={ href }
							onClick={ onClick }
							target={ target }
						>
							{ ( completed && completedTitle ) || title }
						</Button>
					</h3>
					<p className="checklist__task-description">{ description }</p>
					{ completedDescription && (
						<p className="checklist__task-completed-description">{ completedDescription }</p>
					) }
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<div className="checklist__task-secondary">
					<Button
						className="checklist__task-action"
						href={ href }
						onClick={ onClick }
						primary={ buttonPrimary }
						target={ target }
					>
						{ hasActionlink ? completedButtonText : buttonText }
					</Button>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>

				{ this.renderCheckmarkIcon() }
			</CompactCard>
		);
	}
}

export default localize( Task );
