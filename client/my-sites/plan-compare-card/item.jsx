/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'PlanCompareCardItem',

	propTypes: {
		highlight: PropTypes.bool,
		unavailable: PropTypes.bool
	},

	getDefaultProps() {
		return {
			highlight: false,
			unavailable: false
		};
	},

	render() {
		const classes = classNames( this.props.className, 'plan-compare-card-item', {
			'is-highlight': this.props.highlight,
			'is-unavailable': this.props.unavailable
		} );
		const showCheckmark = this.props.highlight || ! this.props.unavailable;
		return (
			<li className={ classes }>
				{ showCheckmark && <Gridicon className="plan-compare-card-item__checkmark" size={ 18 } icon="checkmark" /> }
				{ this.props.children }
			</li>
		);
	}
} );
