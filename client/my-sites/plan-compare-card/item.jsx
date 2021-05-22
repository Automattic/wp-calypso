/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

export default class PlanCompareCardItem extends React.Component {
	static propTypes = {
		highlight: PropTypes.bool,
		unavailable: PropTypes.bool,
	};

	static defaultProps = {
		highlight: false,
		unavailable: false,
	};

	render() {
		const classes = classNames( this.props.className, 'plan-compare-card-item', {
			'is-highlight': this.props.highlight,
			'is-unavailable': this.props.unavailable,
		} );
		const showCheckmark = this.props.highlight || ! this.props.unavailable;
		return (
			<li className={ classes }>
				{ showCheckmark && (
					<Gridicon size={ 18 } icon="checkmark" className="plan-compare-card__item-checkmark" />
				) }
				{ this.props.children }
			</li>
		);
	}
}
