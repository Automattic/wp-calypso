/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

class StatsModuleExpand extends PureComponent {
	static propTypes = {
		href: PropTypes.string
	};

	render() {
		if ( ! this.props.href ) {
			return null;
		}

		return (
			<div className="stats-module__expand">
				<a href={ this.props.href }>
					{ this.props.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }
					<span className="stats-module__expand-right"></span>
				</a>
			</div>
		);
	}
}

export default localize( StatsModuleExpand );
