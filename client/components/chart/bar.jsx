/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRtl as isRtlSelector } from 'state/selectors';

class ModuleChartBar extends Component {
	static propTypes = {
		isTouch: PropTypes.bool,
		tooltipPosition: PropTypes.string,
		className: PropTypes.string,
		clickHandler: PropTypes.func,
		data: PropTypes.object.isRequired,
		max: PropTypes.number,
		count: PropTypes.number,
	};

	static defaultProps = {
		max: Infinity,
	};

	state = { showPopover: false };

	buildSections = () => {
		const { active, data, max } = this.props;
		const { nestedValue, value } = data;

		const percentage = Math.ceil( value / max * 10000 ) / 100,
			remain = 100 - percentage,
			remainFloor = Math.max( 1, Math.floor( remain ) ),
			sections = [],
			spacerClassOptions = {
				'chart__bar-section': true,
				'is-spacer': true,
				'is-ghost': 100 === remain && ! active,
			},
			remainStyle = {
				height: remainFloor + '%',
			},
			valueStyle = {
				top: remainFloor + '%',
			};
		let nestedBar, nestedPercentage, nestedStyle;

		sections.push(
			<div key="spacer" className={ classNames( spacerClassOptions ) } style={ remainStyle } />
		);

		if ( nestedValue ) {
			nestedPercentage = value ? Math.ceil( nestedValue / value * 10000 ) / 100 : 0;

			nestedStyle = { height: nestedPercentage + '%' };

			nestedBar = (
				<div key="nestedValue" className="chart__bar-section-inner" style={ nestedStyle } />
			);
		}

		sections.push(
			<div
				ref={ this.setRef }
				key="value"
				className="chart__bar-section is-bar"
				style={ valueStyle }
			>
				{ nestedBar }
			</div>
		);

		sections.push(
			<div key="label" className="chart__bar-label">
				{ this.props.label }
			</div>
		);

		return sections;
	};

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
			const wrapperClasses = [ 'module-content-list-item' ];
			let gridiconSpan;

			if ( options.icon ) {
				gridiconSpan = <Gridicon icon={ options.icon } size={ 18 } />;
			}

			wrapperClasses.push( options.className );

			return (
				<li key={ i } className={ wrapperClasses.join( ' ' ) }>
					<span className="chart__tooltip-wrapper wrapper">
						<span className="chart__tooltip-value value">{ options.value }</span>
						<span className="chart__tooltip-label label">
							{ gridiconSpan }
							{ options.label }
						</span>
					</span>
				</li>
			);
		} );
	}

	setRef = ref => ( this.bar = ref );

	render() {
		const barClass = classNames( 'chart__bar', this.props.className );
		const count = this.props.count || 1;
		const barStyle = {
			width: 1 / count * 100 + '%',
		};

		return (
			<div
				onClick={ this.clickHandler }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				className={ classNames( barClass ) }
				style={ barStyle }
			>
				{ this.buildSections() }
				<div className="chart__bar-marker is-hundred" />
				<div className="chart__bar-marker is-fifty" />
				<div className="chart__bar-marker is-zero" />
			</div>
		);
	}
}

export default connect( state => ( {
	isRtl: isRtlSelector( state ),
} ) )( ModuleChartBar );
