import clsx from 'clsx';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

export default class ChartBarTooltip extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		icon: PropTypes.object,
		label: PropTypes.string,
		value: PropTypes.string,
	};

	render() {
		return (
			<li className={ clsx( 'module-content-list-item', this.props.className ) }>
				<span className="chart__tooltip-wrapper wrapper">
					<span className="chart__tooltip-value value">{ this.props.value }</span>
					<span className="chart__tooltip-label label">
						{ this.props.icon || null }
						{ this.props.label }
					</span>
				</span>
			</li>
		);
	}
}
