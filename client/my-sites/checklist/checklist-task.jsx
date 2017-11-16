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
import ScreenReaderText from 'components/screen-reader-text';

export class ChecklistTask extends PureComponent {
	static propTypes = {
		id: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
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
			completed,
			completedTitle,
			completedButtonText,
			description,
			duration,
			title,
			translate,
		} = this.props;
		const hasActionlink = completed && completedButtonText;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card
				compact
				className={ classNames( 'checklist-task', {
					'is-completed': completed,
					'has-actionlink': hasActionlink,
				} ) }
			>
				<div className="checklist-task__primary">
					<h5 className="checklist-task__title">{ ( completed && completedTitle ) || title }</h5>
					<p className="checklist-task__description">{ description }</p>
					{ duration && (
						<small className="checklist-task__duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<div className="checklist-task__secondary">
					<Button className="checklist-task__action" onClick={ this.handleClick }>
						{ hasActionlink ? completedButtonText : translate( 'Do it!' ) }
					</Button>
					{ duration && (
						<small className="checklist-task__duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<span
					className="checklist-task__icon"
					onClick={ this.handleToggle }
					tabIndex="0"
					role="button"
					aria-pressed={ completed ? 'true' : 'false' }
				>
					<ScreenReaderText>
						{ completed ? translate( 'Mark as uncompleted' ) : translate( 'Mark as completed' ) }
					</ScreenReaderText>
					{ completed && <Gridicon icon="checkmark" size={ 18 } /> }
				</span>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ChecklistTask );
