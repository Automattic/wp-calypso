import classNames from 'classnames';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import Gridicon from 'gridicons';

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
				{ showCheckmark && <span className="plan-compare-card__item-checkmark"><Gridicon size={ 18 } icon="checkmark" /></span> }
				{ this.props.children }
			</li>
		);
	}
} );
