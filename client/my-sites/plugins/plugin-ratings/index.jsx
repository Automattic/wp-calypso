import { formatNumber } from '@automattic/number-formatters';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

class PluginRatings extends Component {
	static propTypes = {
		rating: PropTypes.number,
	};

	render() {
		const { rating } = this.props;

		if ( ! rating ) {
			return null;
		}

		return (
			<div>
				{ formatNumber( rating / 20, {
					decimals: Number.isInteger( rating / 20 ) ? 0 : 1,
				} ) }
				/5
			</div>
		);
	}
}

export default localize( PluginRatings );
