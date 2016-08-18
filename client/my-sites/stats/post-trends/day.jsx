/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

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
		const content = this.translate(
			'%(posts)d post',
			'%(posts)d posts', {
				count: postCount,
				args: {
					posts: postCount
				},
				comment: 'How many posts published on a certain date.'
			}
		);

		return ( <span>
				<span className="post-count">{ content } </span>
				<span className="date">{ label }</span>
		</span> );
	},

	render: function() {
		const { postCount, className } = this.props;
		const hoveredClass = {
			'is-hovered': this.state.showPopover
		};

		return (
			<div className={ classNames( 'post-trends__day', hoveredClass, className ) }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				ref="day">
				{ ( postCount > 0 ) &&
					<Tooltip
						className="chart__tooltip is-streak"
						id="popover__chart-bar"
						context={ this.refs && this.refs.day }
						isVisible={ this.state.showPopover }
						position="top">
						{ this.buildTooltipData() }
					</Tooltip>
				}
			</div>
		);
	}
} );
