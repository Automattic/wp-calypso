import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export default class extends React.Component {
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
