/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

export default class ModuleChartBar extends Component {
	static propTypes = {
		isTouch: PropTypes.bool,
		tooltipPosition: PropTypes.string,
		className: PropTypes.string,
		clickHandler: PropTypes.func,
		data: PropTypes.object.isRequired,
		max: PropTypes.number,
		count: PropTypes.number,
		isRtl: PropTypes.bool,
	};

	static defaultProps = {
		max: Infinity,
	};

	state = { showPopover: false };

	clickHandler = () => {
		if ( typeof this.props.clickHandler === 'function' ) {
			this.props.clickHandler( this.props.data );
		}
	};

	computeTooltipPosition() {
		const { chartWidth, index, count, isRtl } = this.props;

		const barWidth = chartWidth / count;
		const barOffset = barWidth * ( index + 1 );

		let tooltipPosition = isRtl ? 'bottom left' : 'bottom right';

		if ( barOffset + 230 > chartWidth && barOffset + barWidth - 230 > 0 ) {
			tooltipPosition = isRtl ? 'bottom right' : 'bottom left';
		}

		return tooltipPosition;
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
		const { tooltipData } = this.props.data;

		return tooltipData.map( function( options, i ) {
			return (
				<li key={ i } className={ classNames( 'module-content-list-item', options.className ) }>
					<span className="chart__tooltip-wrapper wrapper">
						<span className="chart__tooltip-value value">{ options.value }</span>
						<span className="chart__tooltip-label label">
							{ options.icon && <Gridicon icon={ options.icon } size={ 18 } /> }
							{ options.label }
						</span>
					</span>
				</li>
			);
		} );
	}

	getPercentage() {
		const {
			data: { value },
			max,
		} = this.props;
		return Math.ceil( ( value / max ) * 10000 ) / 100;
	}

	getNestedPercentage() {
		const {
			data: { nestedValue, value },
		} = this.props;
		return value && nestedValue ? Math.ceil( ( nestedValue / value ) * 10000 ) / 100 : 0;
	}

	setRef = ref => ( this.bar = ref );

	renderSpacer() {
		const percentage = this.getPercentage();
		return (
			<div
				key="spacer"
				className={ classNames( 'chart__bar-section', 'is-spacer', {
					'is-ghost': 0 === percentage && ! this.props.active,
				} ) }
				style={ { height: `${ Math.max( 1, Math.floor( 100 - percentage ) ) }%` } }
			/>
		);
	}

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
		const percentage = this.getPercentage();
		return (
			<div
				ref={ this.setRef }
				key="value"
				className="chart__bar-section is-bar"
				style={ { top: `${ Math.max( 1, Math.floor( 100 - percentage ) ) }%` } }
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
				className={ classNames( 'chart__bar', this.props.className ) }
			>
				{ this.renderSpacer() }
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
