/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import RecommendationOption from './recommendation-option';

class RecommendationSelect extends PureComponent {
	static propTypes = {
		disabled: PropTypes.bool
	}

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
		const values = range( 0, 11 );
		const options = values.map( ( value ) => this.renderOption( value ) );

		return (
			<div>
				{ options }
			</div>
		);
	}
}

export default RecommendationSelect;
