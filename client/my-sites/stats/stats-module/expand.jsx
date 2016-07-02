/**
 * External dependencies
 */
import React from 'react';
import PureComponent from 'react-pure-render/component';

export default class StatsModuleExpand extends PureComponent {
	static propTypes = {
		href: React.PropTypes.string
	};

	render() {
		if ( ! this.props.href ) {
			return null;
		}

		return (
			<div className="stats-module__expand">
				<a href={ this.props.href }>
					{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }
					<span className="stats-module__expand-right"></span>
				</a>
			</div>
		);
	}
}
