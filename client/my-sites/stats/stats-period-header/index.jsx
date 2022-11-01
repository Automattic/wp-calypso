import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import './style.scss';

class StatsPeriodHeader extends PureComponent {
	static propTypes = {
		children: PropTypes.array,
	};

	static defaultProps = {
		children: [],
	};

	render() {
		const { children } = this.props;

		return <div className="stats__period-header">{ children }</div>;
	}
}

export default StatsPeriodHeader;
