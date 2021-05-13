/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */

export default class Delta extends Component {
	static propTypes = {
		className: PropTypes.string,
		icon: PropTypes.string,
		iconSize: PropTypes.number,
		suffix: PropTypes.string,
		value: PropTypes.string.isRequired,
	};

	static defaultProps = {
		iconSize: 20,
	};

	render() {
		const { className, icon, iconSize, suffix, value } = this.props;
		const deltaClasses = classnames( 'delta', className );
		const undefinedIncrease = includes( className, 'is-undefined-increase' );
		let deltaIcon;
		if ( icon ) {
			deltaIcon = icon;
		} else {
			deltaIcon =
				includes( className, 'is-increase' ) || undefinedIncrease ? 'arrow-up' : 'arrow-down';
			deltaIcon = includes( className, 'is-neutral' ) ? 'minus-small' : deltaIcon;
		}
		return (
			<div className={ deltaClasses }>
				<Gridicon className="delta__icon" icon={ deltaIcon } size={ iconSize } />
				<span className="delta__labels">
					{ ! undefinedIncrease && <span className="delta__value">{ value }</span> }
					{ suffix && <span className="delta__suffix">{ suffix }</span> }
				</span>
			</div>
		);
	}
}
