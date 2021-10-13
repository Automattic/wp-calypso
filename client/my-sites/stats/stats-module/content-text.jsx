import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class extends Component {
	static displayName = 'StatsModuleContentText';

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		return (
			<div className={ classNames( 'module-content-text', this.props.className ) }>
				{ this.props.children }
			</div>
		);
	}
}
