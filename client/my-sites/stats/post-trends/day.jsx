/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import Tooltip from 'components/chart/tooltip';

export default React.createClass( {

	displayName: 'PostTrendsDay',

	mixins: [ PureRenderMixin ],

	propTypes: {
		label: PropTypes.string,
		className: PropTypes.string,
		postCount: PropTypes.number
	},

	getDefaultProps() {
		return {
			postCount: 0
		};
	},

	getInitialState() {
		return { showPopover: false };
	},

	mouseEnter() {
		this.setState( { showPopover: true } );
	},

	mouseLeave() {
		this.setState( { showPopover: false } );
	},

	buildTooltipData() {
		const { label, postCount } = this.props;

		const labelWrapper = (
			<span>
				<span className="post-count">{
					this.translate(
						'%(posts)d post',
						'%(posts)d posts', {
							count: postCount,
							args: {
								posts: postCount
							},
							comment: 'How many posts published on a certain date.'
						}
					)
				} </span>
				<span className="date">{ label }</span>
			</span>
		);

		return [ { label: labelWrapper } ];
	},

	render: function() {
		const { postCount, className } = this.props;
		const hoveredClass = {
			'is-hovered': this.state.showPopover
		};

		let tooltip;

		if ( postCount > 0 ) {
			tooltip = (
				<Popover context={ this.refs && this.refs.day }
					isVisible={ this.state.showPopover }
					position="top"
					className="chart__tooltip is-streak"
					onClose={ noop }
					>
					<Tooltip data={ this.buildTooltipData() } />
				</Popover>
			);
		}

		return (
			<div className={ classNames( 'post-trends__day', hoveredClass, className ) }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				ref="day">
				{ tooltip }
			</div>
		);
	}
} );
