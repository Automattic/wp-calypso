/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import GridiconListItem from 'components/gridicon-list/item';

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
			<GridiconListItem className={ classes } icon={ showCheckmark ? 'checkmark' : null }>
				{ this.props.children }
			</GridiconListItem>
		);
	}
} );
