/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */

export default class Delta extends Component {

	static propTypes = {
		classNames: PropTypes.string,
		icon: PropTypes.string,
		suffix: PropTypes.string,
		value: PropTypes.string.isRequired,
	};

	render() {
		const { classNames, icon, suffix, value } = this.props;
		const deltaClasses = classnames( 'delta', classNames );
		let deltaIcon;
		if ( icon ) {
			deltaIcon = icon;
		} else {
			deltaIcon = ( includes( classNames, 'is-increase' ) ) ? 'arrow-up' : 'arrow-down';
			deltaIcon = ( includes( classNames, 'is-neutral' ) ) ? 'minus-small' : deltaIcon;
		}
		return (
			<div className={ deltaClasses }>
				<Gridicon className="delta__icon" icon={ deltaIcon } />
				<span className="delta__value">{ value }</span>
				{ suffix &&
					<span className="delta__suffix">{ suffix }</span>
				}
			</div>
		);
	}
}
