/** @format */

/**
 * External dependencies
 */
import React from 'react';
import closest from 'component-closest';
import { connect } from 'react-redux';
import { last, map, range, uniq } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import DropdownLabel from 'components/select-dropdown/label';
import DropdownSeparator from 'components/select-dropdown/separator';
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
		const previousMonths = range( 6 ).map( function( n ) {
			return this.props.moment().subtract( n, 'months' );
		}, this );

		return (
			<SelectDropdown
				selectedText={ this.props.translate( 'Date' ) }
				onClick={ this.handleAppsPopoverLinkClick }
				className="billing-history__transactions-header-select-dropdown"
			>
				<DropdownLabel>{ this.props.translate( 'Recent Transactions' ) }</DropdownLabel>
				{ this.renderDatePicker( '5 Newest', this.props.translate( '5 Newest' ), {
					newest: 5,
				} ) }
				{ this.renderDatePicker( '10 Newest', this.props.translate( '10 Newest' ), {
					newest: 10,
				} ) }
				<DropdownSeparator />
				<DropdownLabel>{ this.props.translate( 'By Month' ) }</DropdownLabel>
				{ previousMonths.map( function( month, index ) {
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
				}, this ) }

				{ this.renderDatePicker( 'Older', this.props.translate( 'Older' ), {
					before: last( previousMonths ),
				} ) }
			</SelectDropdown>
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

		analyticsEvent = 'undefined' === typeof analyticsEvent ? titleKey : analyticsEvent;

		return (
			<DropdownItem
				key={ titleKey }
				selected={ isSelected }
				onClick={ this.getDatePopoverItemClickHandler( analyticsEvent, filter ) }
				count={ date.newest ? null : this.getFilterCount( filter ) }
			>
				{ titleTranslated }
			</DropdownItem>
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
		return (
			<SelectDropdown
				selectedText={ this.props.translate( 'All Apps' ) }
				onClick={ this.handleAppsPopoverLinkClick }
				className="billing-history__transactions-header-select-dropdown"
			>
				<DropdownLabel>{ this.props.translate( 'App Name' ) }</DropdownLabel>
				{ this.renderAppPicker( this.props.translate( 'All Apps' ), 'all' ) }
				{ this.getApps().map( function( app ) {
					return this.renderAppPicker( app, app, 'Specific App' );
				}, this ) }
			</SelectDropdown>
		);
	}

	getApps() {
		return uniq( map( this.props.transactions, 'service' ) );
	}

	renderAppPicker( title, app, analyticsEvent ) {
		const filter = { app };
		const selected = app === this.props.filter.app;

		return (
			<DropdownItem
				key={ app }
				selected={ selected }
				onClick={ this.getAppPopoverItemClickHandler( analyticsEvent, filter ) }
				count={ this.getFilterCount( filter ) }
			>
				{ title }
			</DropdownItem>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( TransactionsHeader ) );
