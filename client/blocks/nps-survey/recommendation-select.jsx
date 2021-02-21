/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { range } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RecommendationOption from './recommendation-option';

class RecommendationSelect extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool,
	};

	renderOption( value ) {
		return (
			<RecommendationOption
				key={ value }
				value={ value }
				selected={ this.props.value === value }
				disabled={ this.props.disabled }
				onChange={ this.props.onChange }
			/>
		);
	}

	render() {
		const { translate } = this.props;
		const values = range( 0, 11 );
		const options = values.map( ( value ) => this.renderOption( value ) );

		return (
			<div className="nps-survey__recommendation-select">
				<div className="nps-survey__scale-labels">
					<span>
						{ translate( 'Unlikely', {
							context: 'NPS',
							comment:
								'Answer to the question: How likely are you to recommend WordPress.com to your friends, family, or colleagues?',
						} ) }
					</span>
					<span className="nps-survey__very-likely-label">
						{ translate( 'Very likely', {
							context: 'NPS',
							comment:
								'Answer to the question: How likely are you to recommend WordPress.com to your friends, family, or colleagues?',
						} ) }
					</span>
				</div>
				<div className="nps-survey__options">{ options }</div>
			</div>
		);
	}
}

export default localize( RecommendationSelect );
