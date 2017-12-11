/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ScreenReaderText from 'components/screen-reader-text';
import { createNotice } from 'state/notices/actions';
import notices from 'notices';

export class ChecklistTask extends PureComponent {
	constructor() {
		super( ...arguments );

		this.state = {
			useState: true,
			completed: this.props.completed,
		};
	}

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
		if ( ! this.props.completed || ! this.state.completed ) {
			this.setState( { completed: true } );

			const message = `You completed a task.`;
			if ( this.state.useState ) {
				this.props.createNotice( `is-success`, message );
			} else {
				notices[ success ]( message );
			}

			this.props.onToggle( this.props.id );
		}
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
		const hasActionlink = ( completed || this.state.completed ) && completedButtonText;

		return (
			<Card
				compact
				className={ classNames( 'checklist__task', {
					'is-completed': completed || this.state.completed,
					'has-actionlink': hasActionlink,
				} ) }
			>
				<div className="checklist__task-primary">
					<h5 className="checklist__task-title">
						{ ( ( completed || this.state.completed ) && completedTitle ) || title }
					</h5>
					<p className="checklist__task-description">{ description }</p>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<div className="checklist__task-secondary">
					<Button className="checklist__task-action" onClick={ this.handleClick }>
						{ hasActionlink ? completedButtonText : translate( 'Do it!' ) }
					</Button>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<span
					className="checklist__task-icon"
					onClick={ this.handleToggle }
					tabIndex="0"
					role="button"
					aria-pressed={ completed || this.state.completed ? 'true' : 'false' }
				>
					<ScreenReaderText>
						{ completed || this.state.completed
							? translate( 'Mark as uncompleted' )
							: translate( 'Mark as completed' ) }
					</ScreenReaderText>
					{ <Gridicon icon="checkmark" size={ 18 } /> }
				</span>
			</Card>
		);
	}
}

export default connect( null, { createNotice } )( localize( ChecklistTask ) );
