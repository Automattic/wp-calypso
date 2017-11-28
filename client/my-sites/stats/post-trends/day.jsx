/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

class PostTrendsDay extends React.PureComponent {
	static displayName = 'PostTrendsDay';

	static propTypes = {
		label: PropTypes.string,
		className: PropTypes.string,
		postCount: PropTypes.number,
	};

	static defaultProps = {
		postCount: 0,
	};

	state = { showPopover: false };

	mouseEnter = () => {
		this.setState( { showPopover: true } );
	};

	mouseLeave = () => {
		this.setState( { showPopover: false } );
	};

	buildTooltipData = () => {
		const { label, postCount } = this.props;
		const content = this.props.translate( '%(posts)d post', '%(posts)d posts', {
			count: postCount,
			args: {
				posts: postCount,
			},
			comment: 'How many posts published on a certain date.',
		} );

		return (
			<span>
				<span className="post-count">{ content } </span>
				<span className="date">{ label }</span>
			</span>
		);
	};

	render() {
		const { postCount, className } = this.props;
		const hoveredClass = {
			'is-hovered': this.state.showPopover,
		};

		return (
			<div
				className={ classNames( 'post-trends__day', hoveredClass, className ) }
				onMouseEnter={ postCount > 0 ? this.mouseEnter : null }
				onMouseLeave={ postCount > 0 ? this.mouseLeave : null }
				ref="day"
			>
				{ postCount > 0 && (
					<Tooltip
						className="chart__tooltip is-streak"
						id="popover__chart-bar"
						context={ this.refs && this.refs.day }
						isVisible={ this.state.showPopover }
						position="top"
					>
						{ this.buildTooltipData() }
					</Tooltip>
				) }
			</div>
		);
	}
}

export default localize( PostTrendsDay );
