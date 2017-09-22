/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

export default class StatsModulePlaceholder extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		isLoading: PropTypes.bool
	};

	render() {
		const { className, isLoading } = this.props;

		if ( ! isLoading ) {
			return null;
		}

		const classes = classNames( 'stats-module__placeholder', 'is-void', className );

		return (
			<div className={ classes }>
				<Spinner />
			</div>
		);
	}
}
