/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Fragment } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Tooltip from 'calypso/components/tooltip';

class PostTrendsDay extends React.PureComponent {
	static propTypes = {
		label: PropTypes.string,
		className: PropTypes.string,
		postCount: PropTypes.number,
	};

	static defaultProps = {
		postCount: 0,
	};

	state = { showPopover: false };
	dayRef = React.createRef();

	mouseEnter = () => {
		this.setState( { showPopover: true } );
	};

	mouseLeave = () => {
		this.setState( { showPopover: false } );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
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
			<Fragment>
				<div
					className={ classNames( 'post-trends__day', hoveredClass, className ) }
					onMouseEnter={ postCount > 0 ? this.mouseEnter : null }
					onMouseLeave={ postCount > 0 ? this.mouseLeave : null }
					ref={ this.dayRef }
				/>
				{ postCount > 0 && (
					<Tooltip
						className="chart__tooltip is-streak"
						id="popover__chart-bar"
						context={ this.dayRef.current }
						isVisible={ this.state.showPopover }
						position="top"
					>
						{ this.buildTooltipData() }
					</Tooltip>
				) }
			</Fragment>
		);
	}

	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default localize( PostTrendsDay );
