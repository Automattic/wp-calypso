/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'NoticeAction';

	static propTypes = {
		'aria-label': PropTypes.string,
		href: PropTypes.string,
		onClick: PropTypes.func,
		external: PropTypes.bool,
		icon: PropTypes.string,
	};

	static defaultProps = {
		external: false,
	};

	render() {
		const attributes = {
			'aria-label': this.props[ 'aria-label' ],
			className: 'notice__action',
			href: this.props.href,
			onClick: this.props.onClick,
		};

		if ( this.props.external ) {
			attributes.target = '_blank';
			attributes.rel = 'noopener noreferrer';
		}

		return (
			<a { ...attributes }>
				<span>{ this.props.children }</span>
				{ this.props.icon && <Gridicon icon={ this.props.icon } size={ 24 } /> }
				{ this.props.external && <Gridicon icon="external" size={ 24 } /> }
			</a>
		);
	}
}
