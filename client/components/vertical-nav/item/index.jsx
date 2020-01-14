/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard, Gridicon } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class VerticalNavItem extends Component {
	static propTypes = {
		external: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		onClick: PropTypes.func,
		path: PropTypes.string,
	};

	static defaultProps = {
		external: false,
		isPlaceholder: false,
		onClick: noop,
	};

	placeholder = () => {
		return (
			<CompactCard className="vertical-nav-item is-placeholder">
				<span />
				<span />
			</CompactCard>
		);
	};

	render() {
		if ( this.props.isPlaceholder ) {
			return this.placeholder();
		}

		return (
			<a
				href={ this.props.path }
				onClick={ this.props.onClick }
				target={ this.props.external ? '_blank' : null }
			>
				<CompactCard className="vertical-nav-item">
					{ this.getIcon() }
					<span>{ this.props.children }</span>
				</CompactCard>
			</a>
		);
	}

	getIcon = () => {
		if ( this.props.external ) {
			return <Gridicon icon="external" />;
		}

		return <Gridicon icon="chevron-right" />;
	};
}

export default VerticalNavItem;
