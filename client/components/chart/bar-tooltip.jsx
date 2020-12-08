/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

export default class ChartBarTooltip extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		icon: PropTypes.string,
		label: PropTypes.string,
		value: PropTypes.string,
	};

	render() {
		return (
			<li className={ classNames( 'module-content-list-item', this.props.className ) }>
				<span className="chart__tooltip-wrapper wrapper">
					<span className="chart__tooltip-value value">{ this.props.value }</span>
					<span className="chart__tooltip-label label">
						{ this.props.icon && <Gridicon icon={ this.props.icon } size={ 18 } /> }
						{ this.props.label }
					</span>
				</span>
			</li>
		);
	}
}
