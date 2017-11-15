/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop, omit } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

export class ChecklistTask extends PureComponent {
	static propTypes = {
		title: PropTypes.string.isRequired,
		completedTitle: PropTypes.string,
		description: PropTypes.string.isRequired,
		duration: PropTypes.string,
		completed: PropTypes.bool,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		onClick: noop,
	};

	handleClick = () => {
		this.props.onClick( omit( this.props, [ 'onClick' ] ) );
	};

	render() {
		const { completed, completedTitle, description, duration, title, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card compact className={ classNames( 'checklist-task', { completed } ) }>
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
						{ translate( 'Do it!' ) }
					</Button>
					{ duration && (
						<small className="checklist-task__duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				{ completed && <Gridicon icon="checkmark" size={ 18 } /> }
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ChecklistTask );
