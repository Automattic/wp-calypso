/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ScreenReaderText from 'components/screen-reader-text';
import ProgressBar from 'components/progress-bar';

export class ChecklistHeader extends PureComponent {
	static propTypes = {
		total: PropTypes.number.isRequired,
		completed: PropTypes.number.isRequired,
		hideCompleted: PropTypes.bool,
		hideToggleButton: PropTypes.bool,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		hideCompleted: false,
		hideToggleButton: false,
	};

	renderToggleButton() {
		const { hideCompleted, onClick, translate } = this.props;
		const buttonText = hideCompleted
			? translate( 'Show completed' )
			: translate( 'Hide completed' );

		return (
			<Fragment>
				<label htmlFor="checklist__header-action" className="checklist__header-summary">
					{ buttonText }
				</label>
				<button
					id="checklist__header-action"
					className="checklist__header-action"
					onClick={ onClick }
				>
					<ScreenReaderText>{ buttonText }</ScreenReaderText>
					<Gridicon icon="chevron-down" />
				</button>
			</Fragment>
		);
	}

	render() {
		const { completed, hideToggleButton, total, translate } = this.props;

		return (
			<Card compact className="checklist__header">
				<div className="checklist__header-main">
					<div className="checklist__header-progress">
						<h4 className="checklist__header-progress-text">{ translate( 'Your setup list' ) }</h4>
						<span className="checklist__header-progress-number">{ `${ completed }/${ total }` }</span>
					</div>
					<ProgressBar compact total={ total } value={ completed } />
				</div>
				<div className="checklist__header-secondary">
					{ ! hideToggleButton && this.renderToggleButton() }
				</div>
			</Card>
		);
	}
}

export default localize( ChecklistHeader );
