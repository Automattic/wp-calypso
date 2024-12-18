import { TooltipContent } from '@automattic/components/src/highlight-cards/count-card';
import { TrendComparison } from '@automattic/components/src/highlight-cards/count-comparison-card';
import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import Popover from '@automattic/components/src/popover';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';

class StatsTabsTab extends Component {
	static displayName = 'StatsTabsTab';

	static propTypes = {
		className: PropTypes.string,
		icon: PropTypes.object,
		href: PropTypes.string,
		label: PropTypes.string,
		loading: PropTypes.bool,
		selected: PropTypes.bool,
		tabClick: PropTypes.func,
		compact: PropTypes.bool,
		previousValue: PropTypes.number,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		format: PropTypes.func,
	};

	state = {
		isTooltipVisible: false,
	};

	tooltipRef = createRef();

	clickHandler = ( event ) => {
		if ( this.props.tabClick ) {
			event.preventDefault();
			this.props.tabClick( this.props );
		}
	};

	ensureValue = ( value ) => {
		const { loading, numberFormat, format } = this.props;

		if ( ! loading && ( value || value === 0 ) ) {
			return format ? format( value ) : numberFormat( value );
		}

		return String.fromCharCode( 8211 );
	};

	toggleTooltip = ( isShown ) => {
		this.setState( {
			isTooltipVisible: isShown,
		} );
	};

	render() {
		const {
			className,
			compact,
			children,
			icon,
			href,
			label,
			loading,
			selected,
			tabClick,
			previousValue,
			value,
			hasPreviousData,
		} = this.props;

		const tabClass = clsx( 'stats-tab', className, {
			'is-selected': selected,
			'is-loading': loading,
			'is-low': ! value,
			'is-compact': compact,
			'no-icon': ! icon,
		} );

		const tabIcon = icon ? icon : null;
		const tabLabel = <span className="stats-tabs__label label">{ label }</span>;
		const tabValue = <span className="stats-tabs__value value">{ this.ensureValue( value ) }</span>;
		const hasClickAction = href || tabClick;

		return (
			// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
			<li
				className={ clsx( tabClass, { 'tab-disabled': ! hasClickAction } ) }
				onClick={ this.clickHandler }
			>
				<a
					href={ href }
					onMouseEnter={ () => this.toggleTooltip( true ) }
					onMouseLeave={ () => this.toggleTooltip( false ) }
				>
					{ tabIcon }
					{ tabLabel }
					{ tabValue }
					{ children }
					{ hasPreviousData && (
						<div className="stats-tabs__highlight">
							<span className="stats-tabs__highlight-value" ref={ this.tooltipRef }>
								{ formatNumber( value ) }
							</span>
							<TrendComparison count={ value } previousCount={ previousValue } />
							<Popover
								className="tooltip tooltip--darker highlight-card-tooltip"
								isVisible={ this.state.isTooltipVisible }
								position="bottom right"
								context={ this.tooltipRef.current }
							>
								<TooltipContent
									value={ value }
									label={ label.toLocaleLowerCase() }
									previousValue={ previousValue }
								/>
							</Popover>
						</div>
					) }
				</a>
			</li>
		);
	}
}

export default localize( StatsTabsTab );
