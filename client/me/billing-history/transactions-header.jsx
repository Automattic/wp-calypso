/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import closest from 'component-closest';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { last, map, range, uniq } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import tableRows from './table-rows';
import { recordGoogleEvent } from 'state/analytics/actions';

class TransactionsHeader extends React.Component {
	state = {
		activePopover: '',
		searchValue: '',
	};

	preventEnterKeySubmission = event => {
		event.preventDefault();
	};

	componentWillMount() {
		document.body.addEventListener( 'click', this.closePopoverIfClickedOutside );
	}

	componentWillUnmount() {
		document.body.removeEventListener( 'click', this.closePopoverIfClickedOutside );
	}

	recordClickEvent = action => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	getDatePopoverItemClickHandler( analyticsEvent, filter ) {
		return () => {
			this.recordClickEvent( 'Date Popover Item: ' + analyticsEvent );
			this.handlePickerSelection( filter );
		};
	}

	getAppPopoverItemClickHandler( analyticsEvent, filter ) {
		return () => {
			this.recordClickEvent( 'App Popover Item: ' + analyticsEvent );
			this.handlePickerSelection( filter );
		};
	}

	handleDatePopoverLinkClick = () => {
		this.recordClickEvent( 'Toggle Date Popover in Billing History' );
		this.togglePopover( 'date' );
	};

	handleAppsPopoverLinkClick = () => {
		this.recordClickEvent( 'Toggle Apps Popover in Billing History' );
		this.togglePopover( 'apps' );
	};

	closePopoverIfClickedOutside = event => {
		if ( closest( event.target, 'thead' ) ) {
			return;
		}

		this.setState( { activePopover: '' } );
	};

	render() {
		return (
			<thead>
				<tr className="billing-history__header-row">
					<th className="billing-history__date billing-history__header-column">
						{ this.renderDatePopover() }
					</th>
					<th className="billing-history__trans-app billing-history__header-column">
						{ this.renderAppsPopover() }
					</th>
					<th className="billing-history__search-field billing-history__header-column" />
				</tr>
			</thead>
		);
	}

	setFilter( filter ) {
		this.setState( { activePopover: '' } );
		this.props.onNewFilter( filter );
	}

	renderDatePopover() {
		const isVisible = 'date' === this.state.activePopover,
			classes = classNames( {
				'filter-popover': true,
				'is-popped': isVisible,
			} ),
			previousMonths = range( 6 ).map( function( n ) {
				return this.props.moment().subtract( n, 'months' );
			}, this ),
			monthPickers = previousMonths.map( function( month, index ) {
				let analyticsEvent = 'Current Month';

				if ( 1 === index ) {
					analyticsEvent = '1 Month Before';
				} else if ( 1 < index ) {
					analyticsEvent = index + ' Months Before';
				}

				return this.renderDatePicker(
					month.format( 'MMM YYYY' ),
					month.format( 'MMM YYYY' ),
					{ month: month },
					analyticsEvent
				);
			}, this );

		return (
			<div className={ classes }>
				<strong
					className="filter-popover-toggle date-toggle"
					onClick={ this.handleDatePopoverLinkClick }
				>
					{ this.props.translate( 'Date' ) }
					<Gridicon icon="chevron-down" size={ 18 } />
				</strong>
				<div className="filter-popover-content datepicker">
					<div className="overflow">
						<table>
							<thead>
								<tr>
									<th colSpan="2">{ this.props.translate( 'Recent Transactions' ) }</th>
								</tr>
							</thead>
							<tbody>
								{ this.renderDatePicker( '5 Newest', this.props.translate( '5 Newest' ), {
									newest: 5,
								} ) }
								{ this.renderDatePicker( '10 Newest', this.props.translate( '10 Newest' ), {
									newest: 10,
								} ) }
							</tbody>
							<thead>
								<tr>
									<th>{ this.props.translate( 'By Month' ) }</th>
									<th className="transactions-header__count">
										{ this.props.translate( 'Transactions' ) }
									</th>
								</tr>
							</thead>
							<tbody>
								{ monthPickers }
								{ this.renderDatePicker( 'Older', this.props.translate( 'Older' ), {
									before: last( previousMonths ),
								} ) }
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}

	togglePopover( name ) {
		let activePopover;
		if ( this.state.activePopover === name ) {
			activePopover = '';
		} else {
			activePopover = name;
		}

		this.setState( { activePopover: activePopover } );
	}

	renderDatePicker( titleKey, titleTranslated, date, analyticsEvent ) {
		const filter = { date };
		const currentDate = this.props.filter.date || {};
		let isSelected;

		if ( date.newest ) {
			isSelected = date.newest === currentDate.newest;
		} else if ( date.month && currentDate.month ) {
			isSelected = date.month.isSame( currentDate.month, 'month' );
		} else if ( date.before ) {
			isSelected = Boolean( currentDate.before );
		} else {
			isSelected = false;
		}

		const classes = classNames( {
			'transactions-header__date-picker': true,
			selected: isSelected,
		} );

		analyticsEvent = 'undefined' === typeof analyticsEvent ? titleKey : analyticsEvent;

		return (
			<tr
				key={ titleKey }
				className={ classes }
				onClick={ this.getDatePopoverItemClickHandler( analyticsEvent, filter ) }
			>
				<td className="descriptor">{ titleTranslated }</td>
				<td className="transactions-header__count">
					{ date.newest ? '' : this.getFilterCount( filter ) }
				</td>
			</tr>
		);
	}

	handlePickerSelection( filter ) {
		this.setFilter( filter );
		this.setState( { searchValue: '' } );
	}

	getFilterCount( filter ) {
		if ( ! this.props.transactions ) {
			return;
		}

		return tableRows.filter( this.props.transactions, filter ).length;
	}

	renderAppsPopover() {
		const isVisible = 'apps' === this.state.activePopover;
		const classes = classNames( {
			'filter-popover': true,
			'is-popped': isVisible,
		} );
		const appPickers = this.getApps().map( function( app ) {
			return this.renderAppPicker( app, app, 'Specific App' );
		}, this );

		return (
			<div className={ classes }>
				<strong
					className="filter-popover-toggle app-toggle"
					onClick={ this.handleAppsPopoverLinkClick }
				>
					{ this.props.translate( 'All Apps' ) }
					<Gridicon icon="chevron-down" size={ 18 } />
				</strong>
				<div className="filter-popover-content app-list">
					<table>
						<thead>
							<tr>
								<th>{ this.props.translate( 'App Name' ) }</th>
								<th>{ this.props.translate( 'Transactions' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderAppPicker( this.props.translate( 'All Apps' ), 'all' ) }
							{ appPickers }
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	getApps() {
		return uniq( map( this.props.transactions, 'service' ) );
	}

	renderAppPicker( title, app, analyticsEvent ) {
		const filter = { app };
		const classes = classNames( {
			'app-picker': true,
			selected: app === this.props.filter.app,
		} );

		return (
			<tr
				key={ app }
				className={ classes }
				onClick={ this.getAppPopoverItemClickHandler( analyticsEvent, filter ) }
			>
				<td className="descriptor">{ title }</td>
				<td className="transactions-header__count">{ this.getFilterCount( filter ) }</td>
			</tr>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( TransactionsHeader ) );
