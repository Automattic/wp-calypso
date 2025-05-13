import { formatNumber } from '@automattic/number-formatters';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

class PluginRatings extends Component {
	static propTypes = {
		rating: PropTypes.number,
		slug: PropTypes?.string,
	};

	buildReviewUrl() {
		const { slug } = this.props;
		return `https://wordpress.org/support/plugin/${ slug }/reviews`;
	}

	renderNoReviewState() {
		const { slug } = this.props;

		const onClickPluginRatingsLink = () => {
			gaRecordEvent( 'Plugins', 'Clicked Add a review link', 'Plugin Name', slug );
		};

		return (
			<a
				href={ this.buildReviewUrl( slug ) }
				onClick={ onClickPluginRatingsLink }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ this.props.translate( 'Add a review' ) }
			</a>
		);
	}

	render() {
		const { rating } = this.props;

		if ( rating == null || rating === 0 ) {
			return this.renderNoReviewState();
		}

		return (
			<div>{ rating > 0 && <span>{ formatNumber( rating / 20, { decimals: 1 } ) }/5</span> }</div>
		);
	}
}

export default localize( PluginRatings );
