/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Focusable from 'components/focusable';
import ScreenReaderText from 'components/screen-reader-text';

class Task extends PureComponent {
	static propTypes = {
		buttonPrimary: PropTypes.bool,
		buttonText: PropTypes.node,
		completed: PropTypes.bool,
		completedButtonText: PropTypes.node,
		completedTitle: PropTypes.node,
		description: PropTypes.node,
		duration: PropTypes.string,
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		title: PropTypes.node.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			buttonPrimary,
			completed,
			completedButtonText,
			completedTitle,
			description,
			duration,
			onClick,
			onDismiss,
			title,
			translate,
		} = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;
		const hasActionlink = completed && completedButtonText;

		const ToggleContainer = onDismiss ? Focusable : 'div';

		return (
			<CompactCard
				className={ classNames( 'checklist__task', {
					'is-completed': completed,
					'has-actionlink': hasActionlink,
				} ) }
			>
				<div className="checklist__task-primary">
					<h3 className="checklist__task-title">
						<Button borderless className="checklist__task-title-link" onClick={ onClick }>
							{ ( completed && completedTitle ) || title }
						</Button>
					</h3>
					<p className="checklist__task-description">{ description }</p>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<div className="checklist__task-secondary">
					<Button className="checklist__task-action" onClick={ onClick } primary={ buttonPrimary }>
						{ hasActionlink ? completedButtonText : buttonText }
					</Button>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<ToggleContainer
					className="checklist__task-icon"
					onClick={ onDismiss }
					aria-pressed={
						/* eslint-disable-next-line no-nested-ternary */
						onDismiss ? ( completed ? 'true' : 'false' ) : undefined
					}
				>
					<ScreenReaderText>
						{ /* eslint-disable no-nested-ternary */
						onDismiss
							? completed
								? translate( 'Mark as uncompleted' )
								: translate( 'Mark as completed' )
							: completed
								? translate( 'Complete' )
								: translate( 'Not complete' )
						/* eslint-enable no-nested-ternary */
						 }
					</ScreenReaderText>
					<Gridicon icon="checkmark" size={ 18 } />
				</ToggleContainer>
			</CompactCard>
		);
	}
}

export default localize( Task );
