/**
 * External Dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import { BASE_CLASS } from './helpers/constants';
import { scrollbarHasLayout, getScrollbarClipWidth } from './helpers/dimensions';

export default class ScrollTrack extends PureComponent {
	render() {
		const { className, direction, puckHovered, puckOffset, puckSize, trackHovered } = this.props;
		const isVertical = direction === 'vertical';
		const isHorizontal = direction === 'horizontal';
		const hoverClass = `${ BASE_CLASS }-is-hovered`;
		let transform = null;
		if ( isVertical && puckOffset != null ) {
			transform = `translateY(${ puckOffset }px)`;
		} else if ( isHorizontal && puckOffset != null ) {
			transform = `translateX(${ puckOffset }px)`;
		}

		let trackStyles = null;
		if ( ! scrollbarHasLayout() ) {
			trackStyles = {
				right: `${ getScrollbarClipWidth() }px`,
			};
		}
		const puckStyles = {
			height: isVertical && puckSize != null ? `${ puckSize }px` : null,
			width: isHorizontal && puckSize != null ? `${ puckSize }px` : null,
			transform,
		};
		const trackClasses = classnames( `${ BASE_CLASS }__track ${ BASE_CLASS }__track-${ direction }`, className, {
			[ hoverClass ]: trackHovered,
		} );
		const puckClasses = classnames( `${ BASE_CLASS }__puck ${ BASE_CLASS }__puck-${ direction }`, {
			[ hoverClass ]: puckHovered,
		} );
		return (
			<div ref={ this.props.refFn } className={ trackClasses } style={ trackStyles }>
				<div
					className={ puckClasses }
					style={ puckStyles }
				/>
			</div>
		);
	}
}

ScrollTrack.propTypes = {
	className: PropTypes.string,
	direction: PropTypes.oneOf( [ 'vertical', 'horizontal' ] ),
	refFn: PropTypes.func,
	puckHovered: PropTypes.bool,
	puckOffset: PropTypes.number.isRequired,
	puckSize: PropTypes.number.isRequired,
	trackHovered: PropTypes.bool,
};

ScrollTrack.defaultProps = {
	puckHovered: false,
	trackHovered: false,
};
