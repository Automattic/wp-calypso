/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

export default class Prediction extends Component {
	static propTypes = {
		onPredictionClick: PropTypes.func,
		prediction: PropTypes.object.isRequired,
	};

	handlePredictionClick = () => {
		const { onPredictionClick } = this.props;
		if ( typeof onPredictionClick === 'function' ) {
			onPredictionClick( this.props.prediction );
		}
	};

	render() {
		const { prediction } = this.props;

		return (
			<CompactCard onClick={ this.handlePredictionClick }>
				<strong>{ prediction.structured_formatting.main_text }</strong>
				<br />
				{ prediction.structured_formatting.secondary_text }
			</CompactCard>
		);
	}
}
