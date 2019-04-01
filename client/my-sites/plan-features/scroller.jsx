/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { inRange, range, round } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const MIN_CELL_WIDTH = 240; // px
const SIDE_PANE_RATIO = 0.12; // 12% of full width
const MIN_PLAN_OPACITY = 0.4;

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
		this.state = {
			viewportWidth: 0,
			scrollPos: 0,
			scrollSnapDisabled: false,
		};
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
		this.scrollBy( -1 );
	};

	scrollRight = event => {
		event.preventDefault();
		this.scrollBy( 1 );
	};

	scrollBy( direction ) {
		const { cellWidth, borderSpacing, visibleIndex } = this.computeStyleVars();
		if ( this.containerElement ) {
			const xPos = round( ( visibleIndex + direction ) * ( cellWidth + borderSpacing ) );

			// Workaround: Chrome has a bug to not set the exact scrollLeft value
			// when scroll-snap is turned on.
			this.setState( { scrollSnapDisabled: true }, () => {
				this.containerElement.scrollLeft = xPos;
			} );
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
			this.setState( { viewportWidth: this.containerElement.offsetWidth }, () =>
				this.scrollBy( 0 )
			);
		}
	};

	updateScrollPosition = () => {
		this.updateScrollPositionRaf = null;
		if ( this.containerElement ) {
			this.setState( {
				scrollPos: this.containerElement.scrollLeft,
				scrollSnapDisabled: false,
			} );
		}
	};

	computeStyleVars() {
		const { viewportWidth: vpw, scrollPos } = this.state;
		const { planCount } = this.props;
		const table =
			this.containerElement && this.containerElement.querySelector( '.plan-features__table' );
		const compStyles = window && table && window.getComputedStyle( table );
		const borderSpacing =
			parseInt( compStyles && compStyles.getPropertyValue( 'border-spacing' ) ) || 0;
		let styleWeights = null;
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
			scrollerPadding = `0 ${ paneWidth - borderSpacing / 2 }px`;
			visibleIndex = round( scrollPos / ( cellWidth + borderSpacing ) );

			styleWeights = range( 0, planCount ).map( index => {
				const pos = index - scrollPos / ( cellWidth + borderSpacing );

				if ( inRange( pos, -0.5, visibleCount - 0.5 ) ) {
					return 1;
				}

				if ( pos <= -1 || pos >= visibleCount ) {
					return 0;
				}

				return ( pos <= 0 ? pos + 1 : 1 - ( pos % 1 ) ) * 2;
			} );
		}

		return {
			cellWidth,
			paneWidth,
			scrollerWidth,
			scrollerPadding,
			borderSpacing,
			visibleCount,
			visibleIndex,
			styleWeights,
			showIndicator: planCount > visibleCount,
		};
	}

	renderStyle( { styleWeights, borderSpacing, paneWidth, visibleIndex } ) {
		const { cellSelector } = this.props;

		if ( ! styleWeights ) {
			return null;
		}

		return (
			<>
				<style>
					{ `.plan-features__header-wrapper::before { left: ${ -paneWidth -
						borderSpacing / 2 }px }` }
				</style>
				{ styleWeights.map( ( weight, index ) => {
					const selector = `${ cellSelector }:nth-child(${ index + 1 })`;
					const opacity = round( weight * ( 1 - MIN_PLAN_OPACITY ) + MIN_PLAN_OPACITY, 2 );
					let translateX = inRange( weight, 0, 1 ) ? ( 1 - weight ) * 5 : 0;

					if ( translateX && index < visibleIndex ) {
						translateX = -translateX;
					}

					const transform = translateX ? `transform: translateX( ${ translateX }% );` : '';

					return (
						<style key={ selector }>
							{ `${ selector } { opacity: ${ opacity }; ${ transform } }` }
						</style>
					);
				} ) }
			</>
		);
	}

	renderIndicator( { showIndicator, visibleCount, visibleIndex } ) {
		const dotClass = 'plan-features__scroll-indicator-dot';
		const start = visibleIndex;
		const end = start + visibleCount;

		if ( ! showIndicator ) {
			return null;
		}

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
		const containerClass = classNames( 'plan-features__scroller-container', {
			'scroll-snap-disabled': this.state.scrollSnapDisabled,
		} );

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
			<div className={ containerClass } ref={ this.setContainerRef }>
				{ this.renderStyle( vars ) }
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
				{ this.renderIndicator( vars ) }
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
		);
	}
}
