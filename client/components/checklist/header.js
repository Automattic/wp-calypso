/** @format */
/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ProgressBar from 'components/progress-bar';
import ScreenReaderText from 'components/screen-reader-text';

export class ChecklistHeader extends PureComponent {
	static propTypes = {
		total: PropTypes.number.isRequired,
		completed: PropTypes.number.isRequired,
		hideCompleted: PropTypes.bool,
		onClick: PropTypes.func,
	};

	render() {
		const { completed, hideCompleted, total, translate } = this.props;
		const buttonText = hideCompleted
			? translate( 'Show completed' )
			: translate( 'Hide completed' );

		return (
			<Card compact className="checklist__header">
				<div className="checklist__header-main">
					<div className="checklist__header-progress">
						<h2 className="checklist__header-progress-text">{ translate( 'Your setup list' ) }</h2>
						<span className="checklist__header-progress-number">{ `${ completed }/${ total }` }</span>
					</div>
					<ProgressBar compact total={ total } value={ completed } />
				</div>
				<div className="checklist__header-secondary">
					{ /* eslint-disable-next-line jsx-a11y/label-has-for */ }
					<label htmlFor="checklist__header-action" className="checklist__header-summary">
						{ buttonText }
					</label>
					<button
						id="checklist__header-action"
						className="checklist__header-action"
						onClick={ this.props.onClick }
					>
						<ScreenReaderText>{ buttonText }</ScreenReaderText>
						<Gridicon icon="chevron-down" />
					</button>
				</div>
			</Card>
		);
	}
}

export default localize( ChecklistHeader );
