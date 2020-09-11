/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormRadio from 'calypso/components/forms/form-radio';
import FormLabel from 'calypso/components/forms/form-label';

class RecommendationOption extends Component {
	constructor( props ) {
		super( props );
		this.handleChange = this.handleChange.bind( this );
	}

	static propTypes = {
		disabled: PropTypes.bool,
		selected: PropTypes.bool,
		value: PropTypes.number,
	};

	handleChange( event ) {
		this.props.onChange( parseInt( event.target.value, 10 ) );
	}

	render() {
		const className = classNames( 'nps-survey__recommendation-option', {
			'is-selected': this.props.selected,
		} );

		return (
			<FormLabel className={ className }>
				<FormRadio
					name="nps-survey-recommendation-option"
					value={ this.props.value }
					checked={ this.props.selected }
					disabled={ this.props.disabled }
					onChange={ this.handleChange }
					label={ this.props.value }
				/>
			</FormLabel>
		);
	}
}

export default RecommendationOption;
