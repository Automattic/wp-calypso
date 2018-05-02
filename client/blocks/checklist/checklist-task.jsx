/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Focusable from 'components/focusable';
import ScreenReaderText from 'components/screen-reader-text';

export class ChecklistTask extends PureComponent {
	static propTypes = {
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		buttonText: PropTypes.string,
		buttonPrimary: PropTypes.bool,
		completedTitle: PropTypes.string,
		completedButtonText: PropTypes.string,
		description: PropTypes.string.isRequired,
		duration: PropTypes.string,
		completed: PropTypes.bool,
		onAction: PropTypes.func,
		onToggle: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop,
	};

	handleClick = () => {
		this.props.onAction( this.props.id );
	};

	handleToggle = () => {
		this.props.onToggle( this.props.id );
	};

	render() {
		const {
			buttonPrimary,
			completed,
			completedTitle,
			completedButtonText,
			description,
			duration,
			title,
			translate,
		} = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;
		const hasActionlink = completed && completedButtonText;

		return (
			<Card
				compact
				className={ classNames( 'checklist__task', {
					'is-completed': completed,
					'has-actionlink': hasActionlink,
				} ) }
			>
				<div className="checklist__task-primary">
					<h3 className="checklist__task-title">
						<Button borderless className="checklist__task-title-link" onClick={ this.handleClick }>
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
					<Button
						className="checklist__task-action"
						onClick={ this.handleClick }
						primary={ buttonPrimary }
					>
						{ hasActionlink ? completedButtonText : buttonText }
					</Button>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<Focusable
					className="checklist__task-icon"
					onClick={ this.handleToggle }
					aria-pressed={ completed ? 'true' : 'false' }
				>
					<ScreenReaderText>
						{ completed ? translate( 'Mark as uncompleted' ) : translate( 'Mark as completed' ) }
					</ScreenReaderText>
					{ <Gridicon icon="checkmark" size={ 18 } /> }
				</Focusable>
			</Card>
		);
	}
}

export default localize( ChecklistTask );
