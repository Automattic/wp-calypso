/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { children, className } = this.props;
		const gridClassName = classNames( 'tile-grid', className );

		return <div className={ gridClassName }>{ children }</div>;
	}
}
