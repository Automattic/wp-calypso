/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

const noop = () => {};

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
		const { isPlaceHolder, external, onClick, path, className, children } = this.props;

		if ( isPlaceHolder ) {
			return this.placeholder();
		}

		const compactCardClassNames = classNames( 'vertical-nav-item', className );

		const linkProps = external ? { target: '_blank', rel: 'noreferrer' } : {};

		return (
			<a href={ path } onClick={ onClick } { ...linkProps }>
				<CompactCard className={ compactCardClassNames }>
					{ this.getIcon() }
					<span>{ children }</span>
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
