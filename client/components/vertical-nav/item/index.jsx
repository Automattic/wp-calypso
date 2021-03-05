/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

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
		const compactCardClassNames = classNames(
			'vertical-nav-item is-placeholder',
			this.props.className
		);
		return (
			<CompactCard className={ compactCardClassNames }>
				<span />
				<span />
			</CompactCard>
		);
	};

	render() {
		if ( this.props.isPlaceholder ) {
			return this.placeholder();
		}

		const compactCardClassNames = classNames( 'vertical-nav-item', this.props.className );

		return (
			<a
				href={ this.props.path }
				onClick={ this.props.onClick }
				target={ this.props.external ? '_blank' : null }
			>
				<CompactCard className={ compactCardClassNames }>
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
