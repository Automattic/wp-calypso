/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';

module.exports = React.createClass( {
	displayName: 'ModuleChartBar',

	propTypes: {
		isTouch: React.PropTypes.bool,
		tooltipPosition: React.PropTypes.string,
		className: React.PropTypes.string,
		clickHandler: React.PropTypes.func,
		data: React.PropTypes.object.isRequired,
		max: React.PropTypes.number,
		count: React.PropTypes.number
	},

	getDefaultProps: () => ( {
		max: Infinity,
	} ),

	getInitialState: function() {
		return { showPopover: false };
	},

	buildSections: function() {
		const { active, data, max } = this.props;
		const { nestedValue, value } = data;

		const percentage = Math.ceil( ( value / max ) * 10000 ) / 100,
			remain = 100 - percentage,
			remainFloor = Math.max( 1, Math.floor( remain ) ),
			sections = [],
			spacerClassOptions = {
				'chart__bar-section': true,
				'is-spacer': true,
				'is-ghost': ( 100 === remain ) && ! active
			},
			remainStyle = {
				height: remainFloor + '%'
			},
			valueStyle = {
				top: remainFloor + '%'
			};
		let nestedBar,
			nestedPercentage,
			nestedStyle;

		sections.push( <div key="spacer" className={ classNames( spacerClassOptions ) } style={ remainStyle } /> );

		if ( nestedValue ) {
			nestedPercentage = value ? Math.ceil( ( nestedValue / value ) * 10000 ) / 100 : 0;

			nestedStyle = { height: nestedPercentage + '%' };

			nestedBar = ( <div key="nestedValue" className="chart__bar-section-inner" style={ nestedStyle } /> );
		}

		sections.push( <div ref="valueBar" key="value" className="chart__bar-section is-bar" style={ valueStyle }>{ nestedBar }</div> );

		sections.push( <div key="label" className="chart__bar-label">{ this.props.label }</div> );

		return sections;
	},

	clickHandler: function() {
		if ( 'function' === typeof( this.props.clickHandler ) ) {
			this.props.clickHandler( this.props.data );
		}
	},

	mouseEnter: function() {
		this.setState( { showPopover: true } );
	},

	mouseLeave: function() {
		this.setState( { showPopover: false } );
	},

	renderTooltip() {
		if (
			! this.props.data.tooltipData ||
			! this.props.data.tooltipData.length ||
			this.props.isTouch
		) {
			return null;
		}

		const { tooltipData } = this.props.data;

		const listItemElements = tooltipData.map( function( options, i ) {
			const wrapperClasses = [ 'module-content-list-item' ];
			let	gridiconSpan;

			if ( options.icon ) {
				gridiconSpan = ( <Gridicon icon={ options.icon } size={ 18 } /> );
			}

			wrapperClasses.push( options.className );

			return (
				<li key={ i } className={ wrapperClasses.join( ' ' ) } >
					<span className="chart__tooltip-wrapper wrapper">
						<span className="chart__tooltip-value value">{ options.value }</span>
						<span className="chart__tooltip-label label">{ gridiconSpan }{ options.label }</span>
					</span>
				</li>
			);
		} );

		return (
			<Tooltip
				className="chart__tooltip"
				id="popover__chart-bar"
				showDelay={ 200 }
				context={ this.refs && this.refs.valueBar }
				isVisible={ this.state.showPopover }
				position={ this.props.tooltipPosition }
			>
				<ul>
					{ listItemElements }
				</ul>
			</Tooltip>
		);
	},

	render: function() {
		const barClass = classNames( 'chart__bar', this.props.className );
		const count = this.props.count || 1;
		const barStyle = {
			width: ( ( 1 / count ) * 100 ) + '%'
		};

		return (
			<div onClick={ this.clickHandler }
				onMouseEnter={ this.mouseEnter }
				onMouseLeave={ this.mouseLeave }
				className={ classNames( barClass ) }
				style={ barStyle }>
				{ this.buildSections() }
				<div className="chart__bar-marker is-hundred"></div>
				<div className="chart__bar-marker is-fifty"></div>
				<div className="chart__bar-marker is-zero"></div>
				{ this.renderTooltip() }
			</div>
		);
	}
} );
