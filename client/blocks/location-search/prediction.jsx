/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GridiconChevronRight from 'gridicons/dist/chevron-right';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

export default class Prediction extends Component {
	static propTypes = {
		onPredictionClick: PropTypes.func,
		prediction: PropTypes.shape( {
			structured_formatting: PropTypes.shape( {
				main_text: PropTypes.string.isRequired,
				secondary_text: PropTypes.string.isRequired,
			} ).isRequired,
		} ).isRequired,
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
			<CompactCard className="location-search__prediction" onClick={ this.handlePredictionClick }>
				<strong>{ prediction.structured_formatting.main_text }</strong>
				<br />
				{ prediction.structured_formatting.secondary_text }
				<GridiconChevronRight className="location-search__prediction-icon" />
			</CompactCard>
		);
	}
}
