/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';

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

	handlePredictionKeyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			this.handlePredictionClick();
		}
	};

	render() {
		const { prediction } = this.props;

		return (
			<CompactCard
				tabIndex="0"
				className="location-search__prediction"
				onClick={ this.handlePredictionClick }
				onKeyDown={ this.handlePredictionKeyDown }
			>
				<strong>{ prediction.structured_formatting.main_text }</strong>
				<br />
				{ prediction.structured_formatting.secondary_text }
				<Gridicon className="location-search__prediction-icon" icon="chevron-right" />
			</CompactCard>
		);
	}
}
