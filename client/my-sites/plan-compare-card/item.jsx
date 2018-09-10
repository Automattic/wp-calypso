/** @format */

/**
 * External dependencies
 */

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import GridiconCheckmark from 'gridicons/dist/checkmark';

export default class extends React.Component {
	static displayName = 'PlanCompareCardItem';

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
					<span className="plan-compare-card__item-checkmark">
						<GridiconCheckmark size={ 18 } />
					</span>
				) }
				{ this.props.children }
			</li>
		);
	}
}
