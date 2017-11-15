/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
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
		onClick: PropTypes.func,
	};

	render() {
		const { completed, hideCompleted, total, translate } = this.props;
		const buttonText = hideCompleted
			? translate( 'Show completed' )
			: translate( 'Hide completed' );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card compact className="checklist-header">
				<div className="checklist-header__main">
					<div className="checklist-header__progress">
						<h4 className="checklist-header__progress-text">{ translate( 'Your setup list' ) }</h4>
						<span className="checklist-header__progress-number">{ `${ completed }/${ total }` }</span>
					</div>
					<ProgressBar compact total={ total } value={ completed } />
				</div>
				<div className="checklist-header__secondary">
					<span className="checklist-header__summary">{ buttonText }</span>
					<button className="checklist-header__action" onClick={ this.props.onClick }>
						<ScreenReaderText>{ buttonText }</ScreenReaderText>
						<Gridicon icon="chevron-down" />
					</button>
				</div>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ChecklistHeader );
