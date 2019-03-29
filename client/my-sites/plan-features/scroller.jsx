/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { clamp, range, inRange } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const MIN_CELL_WIDTH = 220; // px
const SIDE_PANE_RATIO = 0.12; // 12% of full width

export default class PlanFeaturesScroller extends PureComponent {
	static propTypes = {
		withScroll: PropTypes.bool.isRequired,
		planCount: PropTypes.number.isRequired,
	};

	static defaultProps = {
		withScroll: false,
		planCount: 0,
	};

	constructor( props ) {
		super( props );
		this.containerElement = null;
		this.state = { viewportWidth: 0, scrollPos: 0 };
	}

	componentDidMount() {
		if ( typeof window !== 'undefined' ) {
			window.addEventListener( 'resize', this.handleWindowResize );
		}
	}

	componentWillUnmount() {
		if ( typeof window !== 'undefined' ) {
			window.removeEventListener( 'resize', this.handleWindowResize );
		}
		if ( this.containerElement ) {
			this.containerElement.removeEventListener( 'scroll', this.handleScroll );
		}
	}

	setContainerRef = element => {
		this.containerElement = element;
		element.addEventListener( 'scroll', this.handleScroll );
		this.updateViewportWidth();
	};

	scrollLeft = event => {
		event.preventDefault();
		this.scroll( -1 );
	};

	scrollRight = event => {
		event.preventDefault();
		this.scroll( 1 );
	};

	scroll( direction ) {
		const { cellWidth, borderSpacing, visibleIndex } = this.computeStyleVars();
		if ( this.containerElement ) {
			this.containerElement.scrollLeft =
				( visibleIndex + direction ) * ( cellWidth + borderSpacing );
		}
	}

	handleWindowResize = () => {
		cancelAnimationFrame( this.updateViewportWidthRaf );
		this.updateViewportWidthRaf = window.requestAnimationFrame( this.updateViewportWidth );
	};

	handleScroll = () => {
		cancelAnimationFrame( this.updateScrollPositionRaf );
		this.updateScrollPositionRaf = window.requestAnimationFrame( this.updateScrollPosition );
	};

	updateViewportWidth = () => {
		this.updateViewportWidthRaf = null;
		if ( this.containerElement ) {
			this.setState( { viewportWidth: this.containerElement.offsetWidth } );
		}
	};

	updateScrollPosition = () => {
		this.updateScrollPositionRaf = null;
		if ( this.containerElement ) {
			this.setState( { scrollPos: this.containerElement.scrollLeft } );
		}
	};

	computeStyleVars() {
		const { viewportWidth: vpw } = this.state;
		const { planCount } = this.props;
		const borderSpacing = clamp( vpw * 0.015, 5, 15 );
		let paneWidth = '0';
		let visibleCount = planCount;
		let visibleIndex = 0;
		let cellWidth = ( vpw - borderSpacing * ( visibleCount + 1 ) ) / visibleCount;
		let scrollerWidth = 'auto';
		let scrollerPadding = '0';

		if ( vpw && cellWidth < MIN_CELL_WIDTH ) {
			// Each cell should be wider than MIN_CELL_WIDTH
			do {
				visibleCount--;
				cellWidth = ( vpw * ( 1 - SIDE_PANE_RATIO * 2 ) ) / visibleCount - borderSpacing;
			} while ( cellWidth < MIN_CELL_WIDTH );

			paneWidth = SIDE_PANE_RATIO * vpw;
			scrollerWidth = ( cellWidth + borderSpacing ) * planCount + borderSpacing;
			scrollerPadding = `0 ${ paneWidth }px`;
			visibleIndex = Math.floor( this.state.scrollPos / cellWidth );
		}

		return {
			cellWidth,
			paneWidth,
			scrollerWidth,
			scrollerPadding,
			borderSpacing,
			visibleCount,
			visibleIndex,
			showIndicator: planCount > visibleCount,
		};
	}

	renderIndicator( { visibleCount, visibleIndex } ) {
		const dotClass = 'plan-features__scroll-indicator-dot';
		const start = visibleIndex;
		const end = start + visibleCount;

		return (
			<div className="plan-features__scroll-indicator">
				{ range( 0, this.props.planCount ).map( index => (
					<span
						key={ index }
						className={ classNames( dotClass, { 'is-highlighted': inRange( index, start, end ) } ) }
					/>
				) ) }
			</div>
		);
	}

	render() {
		const { children, withScroll, planCount } = this.props;

		if ( ! withScroll ) {
			return <>{ children }</>;
		}

		const vars = this.computeStyleVars();

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
			<div className="plan-features__scroller-container" ref={ this.setContainerRef }>
				<div
					className="plan-features__scroll-left"
					style={ { width: vars.paneWidth } }
					onClick={ this.scrollLeft }
				>
					<Button
						className="plan-features__scroll-button"
						disabled={ 0 === vars.visibleIndex }
						onClick={ this.scrollLeft }
						tabIndex="0"
					>
						<Gridicon icon="arrow-left" size={ 24 } />
					</Button>
				</div>
				<div
					className="plan-features__scroller"
					style={ { width: vars.scrollerWidth, padding: vars.scrollerPadding } }
				>
					{ children }
				</div>
				<div
					className="plan-features__scroll-right"
					style={ { width: vars.paneWidth } }
					onClick={ this.scrollRight }
				>
					<Button
						className="plan-features__scroll-button"
						disabled={ planCount === vars.visibleIndex + vars.visibleCount }
						onClick={ this.scrollRight }
					>
						<Gridicon icon="arrow-right" size={ 24 } />
					</Button>
				</div>
				{ vars.showIndicator && this.renderIndicator( vars ) }
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
		);
	}
}
