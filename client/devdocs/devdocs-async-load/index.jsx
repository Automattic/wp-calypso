/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import Placeholder from './placeholder';

export default class DevdocsAsyncLoad extends React.PureComponent {
	static defaultProps = {
		placeholderCount: 5,
	};
	static propTypes = {
		placeholderCount: PropTypes.number,
		require: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ).isRequired,
	};

	render() {
		const { placeholderCount, require, ...otherProps } = this.props;

		// If `component` is truthy, we're only rendering one component
		// (e.g. `/devdocs/blocks/login` not `/devdocs/blocks`), so we will
		// ignore the number of placeholders to render and just render one.
		const placeholders = this.props.component ? 1 : placeholderCount;

		return (
			<AsyncLoad
				placeholder={ <Placeholder count={ placeholders } /> }
				require={ require }
				{ ...otherProps }
			/>
		);
	}
}
