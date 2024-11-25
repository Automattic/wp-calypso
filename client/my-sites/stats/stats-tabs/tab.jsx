import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

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
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		format: PropTypes.func,
	};

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

	render() {
		const { className, compact, children, icon, href, label, loading, selected, tabClick, value } =
			this.props;

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
				<a href={ href }>
					{ tabIcon }
					{ tabLabel }
					{ tabValue }
					{ children }
				</a>
			</li>
		);
	}
}

export default localize( StatsTabsTab );
