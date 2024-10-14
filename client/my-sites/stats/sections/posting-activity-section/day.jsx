import { Tooltip } from '@automattic/components';
import { Icon, postContent } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, PureComponent, Fragment } from 'react';

class PostTrendsDay extends PureComponent {
	static propTypes = {
		date: PropTypes.object,
		className: PropTypes.string,
		postCount: PropTypes.number,
	};

	static defaultProps = {
		postCount: 0,
	};

	state = { showPopover: false };
	dayRef = createRef();

	mouseEnter = () => {
		this.setState( { showPopover: true } );
	};

	mouseLeave = () => {
		this.setState( { showPopover: false } );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	buildTooltipData = () => {
		const { date, postCount, locale } = this.props;
		const weekDay = date.toLocaleDateString( locale, { weekday: 'long' } );
		const formattedDate = date.toLocaleDateString( locale, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		} );

		const postPublished = this.props.translate(
			'%(posts)d post published',
			'%(posts)d posts published',
			{
				count: postCount,
				args: {
					posts: postCount,
				},
				comment: 'How many posts published on a certain date.',
			}
		);

		return (
			<span className="post-trends__tooltip-content">
				<div className="post-date">
					{ formattedDate } ({ weekDay })
				</div>

				<div className="post-count">
					<Icon icon={ postContent } className="post-count-icon" />
					{ postPublished }
				</div>
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
					className={ clsx( 'post-trends__day', hoveredClass, className ) }
					onMouseEnter={ postCount > 0 ? this.mouseEnter : null }
					onMouseLeave={ postCount > 0 ? this.mouseLeave : null }
					ref={ this.dayRef }
				/>
				{ postCount > 0 && (
					<Tooltip
						className="is-streak tooltip--large"
						id="post-trends__tooltip"
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
