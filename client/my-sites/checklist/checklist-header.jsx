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

let globalIndex = 0;

export class ChecklistHeader extends PureComponent {
	static propTypes = {
		total: PropTypes.number.isRequired,
		completed: PropTypes.number.isRequired,
		hideCompleted: PropTypes.bool,
		onClick: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.index = globalIndex++;
	}

	render() {
		const { completed, hideCompleted, total, translate } = this.props;
		const buttonText = hideCompleted
			? translate( 'Show completed' )
			: translate( 'Hide completed' );

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
					<label htmlFor={ `checklist-header-${ this.index }` } className="checklist-header__summary">{ buttonText }</label>
					<button id={ `checklist-header-${ this.index }` } className="checklist-header__action" onClick={ this.props.onClick }>
						<ScreenReaderText>{ buttonText }</ScreenReaderText>
						<Gridicon icon="chevron-down" />
					</button>
				</div>
			</Card>
		);
	}
}

export default localize( ChecklistHeader );
