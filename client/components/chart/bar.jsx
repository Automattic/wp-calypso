import clsx from 'clsx';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import ChartBarTooltip from './bar-tooltip';

export default class ChartBar extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		clickHandler: PropTypes.func,
		count: PropTypes.number,
		data: PropTypes.object.isRequired,
		isTouch: PropTypes.bool,
		max: PropTypes.number,
		tooltipPosition: PropTypes.string,
	};

	static defaultProps = {
		max: Infinity,
	};

	clickHandler = () => {
		if ( typeof this.props.clickHandler === 'function' ) {
			this.props.clickHandler( this.props.data );
		}
	};

	computeTooltipPosition() {
		const { chartWidth, index, count } = this.props;

		const barWidth = chartWidth / count;
		const barOffset = barWidth * ( index + 1 );
		const shouldFlip = barOffset > chartWidth - 230 && barOffset + barWidth > 230;

		return shouldFlip ? 'bottom left' : 'bottom right';
	}

	mouseEnter = () => {
		if (
			! this.props.data.tooltipData ||
			! this.props.data.tooltipData.length ||
			this.props.isTouch
		) {
			return null;
		}

		this.props.setTooltip( this.bar, this.computeTooltipPosition(), this.getTooltipData() );
	};

	mouseLeave = () => {
		this.props.setTooltip( null );
	};

	getTooltipData() {
		return this.props.data.tooltipData.map( function ( options, i ) {
			return <ChartBarTooltip key={ i } { ...options } />;
		} );
	}

	getScaleY() {
		const scaleY = this.props.data.value / this.props.max;
		// Hack: We use an invisible but non-zero value here, becaue zero scaleY-ed bars grows to max and then disappear when combined with container animation on initialization in Chrome.
		return scaleY < 1e-4 ? '0.0001' : scaleY.toFixed( 4 );
	}

	getNestedPercentage() {
		const {
			data: { nestedValue, value },
		} = this.props;
		return value && nestedValue ? Math.ceil( ( nestedValue / value ) * 10000 ) / 100 : 0;
	}

	setRef = ( ref ) => ( this.bar = ref );

	renderNestedBar() {
		const {
			data: { nestedValue },
		} = this.props;

		return (
			nestedValue && (
				<div
					key="nestedValue"
					className="chart__bar-section-inner"
					style={ { height: `${ this.getNestedPercentage() }%` } }
				/>
			)
		);
	}

	renderBar() {
		return (
			<div
				ref={ this.setRef }
				key="value"
				className="chart__bar-section is-bar"
				style={ { transform: `scaleY( ${ this.getScaleY() } )` } }
			>
				{ this.renderNestedBar() }
			</div>
		);
	}

	render() {
		return (
			<div
				role="presentation"
				aria-hidden="true"
				onClick={ this.clickHandler }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				className={ clsx( 'chart__bar', this.props.className ) }
			>
				{ this.renderBar() }
				<div key="label" className="chart__bar-label">
					{ this.props.label }
				</div>
				<div className="chart__bar-marker is-hundred" />
				<div className="chart__bar-marker is-fifty" />
				<div className="chart__bar-marker is-zero" />
			</div>
		);
	}
}
