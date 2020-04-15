/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

class StatsTabsTab extends React.Component {
	static displayName = 'StatsTabsTab';

	static propTypes = {
		className: PropTypes.string,
		gridicon: PropTypes.string,
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
		const { loading, children, numberFormat, format } = this.props;
		if ( children ) {
			return null;
		}

		if ( ! loading && ( value || value === 0 ) ) {
			return format ? format( value ) : numberFormat( value );
		}

		return String.fromCharCode( 8211 );
	};

	render() {
		const {
			className,
			compact,
			children,
			gridicon,
			href,
			label,
			loading,
			selected,
			tabClick,
			value,
		} = this.props;

		const tabClass = classNames( 'stats-tab', className, {
			'is-selected': selected,
			'is-loading': loading,
			'is-low': ! value,
			'is-compact': compact,
		} );

		const tabIcon = gridicon ? <Gridicon icon={ gridicon } size={ 18 } /> : null;
		const tabLabel = <span className="label">{ label }</span>;
		const tabValue = <span className="value">{ this.ensureValue( value ) }</span>;
		const hasClickAction = href || tabClick;

		return (
			<li className={ tabClass } onClick={ this.clickHandler }>
				{ hasClickAction ? (
					<a href={ href }>
						{ tabIcon }
						{ tabLabel }
						{ tabValue }
						{ children }
					</a>
				) : (
					<span className="no-link">
						{ tabIcon }
						{ tabLabel }
						{ tabValue }
						{ children }
					</span>
				) }
			</li>
		);
	}
}

export default localize( StatsTabsTab );
