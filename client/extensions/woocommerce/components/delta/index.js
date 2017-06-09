/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */

export default class Delta extends Component {

	static propTypes = {
		className: PropTypes.string,
		isIncreaseFavorable: PropTypes.bool,
		sinceLabel: PropTypes.string,
		decimalValue: PropTypes.number.isRequired,
	};

	static defaultProps = {
		isIncreaseFavorable: true,
	};

	render() {
		const { className, isIncreaseFavorable, sinceLabel, decimalValue } = this.props;
		const deltaClasses = classnames( 'delta', className );
		const arrowClasses = classnames( 'delta__icon', {
			'is-good': ( decimalValue > 0 && isIncreaseFavorable ) || ( decimalValue < 0 && ! isIncreaseFavorable ),
			'is-bad': ( decimalValue < 0 && isIncreaseFavorable ) || ( decimalValue > 0 && ! isIncreaseFavorable ),

		} );
		const percentValue = Math.round( ( decimalValue * 100 ) * 10 ) / 10;
		let icon = ( percentValue > 0 ) ? 'arrow-up' : 'arrow-down';
		if ( percentValue === 0 ) {
			icon = 'minus-small';
		}
		return (
			<div className={ deltaClasses }>
				<Gridicon
					className={ arrowClasses }
					icon={ icon }
				/>
				<span className="delta__description">
					<span className="delta__description-value">{ `${ Math.abs( percentValue ) }%` }</span>
					<span className="delta__description-since">{ ( sinceLabel ) ? sinceLabel : '' }</span>
				</span>
			</div>
		);
	}
}
