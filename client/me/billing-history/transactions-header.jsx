/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import closest from 'component-closest';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import SelectDropdown from 'components/select-dropdown';
import DropdownItem from 'components/select-dropdown/item';
import DropdownLabel from 'components/select-dropdown/label';
import DropdownSeparator from 'components/select-dropdown/separator';
import { recordGoogleEvent } from 'state/analytics/actions';
import { setApp, setDate } from 'state/ui/billing-transactions/actions';
import getBillingTransactionAppFilterValues from 'state/selectors/get-billing-transaction-app-filter-values';
import getBillingTransactionDateFilterValues from 'state/selectors/get-billing-transaction-date-filter-values';
import getBillingTransactionFilters from 'state/selectors/get-billing-transaction-filters';

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

	getDatePopoverItemClickHandler( analyticsEvent, date ) {
		return () => {
			const { transactionType } = this.props;
			this.recordClickEvent( 'Date Popover Item: ' + analyticsEvent );
			this.props.setDate( transactionType, date.month, date.operator );
			this.setState( { activePopover: '' } );
		};
	}

	getAppPopoverItemClickHandler( analyticsEvent, app ) {
		return () => {
			this.recordClickEvent( 'App Popover Item: ' + analyticsEvent );
			this.props.setApp( this.props.transactionType, app );
			this.setState( { activePopover: '' } );
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
					<th
						className="billing-history__date billing-history__trans-app billing-history__header-column"
						colSpan="3"
					>
						{ this.renderDatePopover() }
						{ this.renderAppsPopover() }
					</th>
				</tr>
			</thead>
		);
	}

	renderDatePopover() {
		const { dateFilters, filter, translate } = this.props;
		const selectedFilter = find( dateFilters, { value: filter.date } );
		const selectedText = selectedFilter ? selectedFilter.title : translate( 'Date' );

		return (
			<SelectDropdown
				selectedText={ selectedText }
				onClick={ this.handleAppsPopoverLinkClick }
				className="billing-history__transactions-header-select-dropdown"
			>
				<DropdownLabel>{ translate( 'Recent Transactions' ) }</DropdownLabel>
				{ this.renderDatePicker(
					'Newest',
					translate( 'Newest' ),
					{
						month: null,
						operator: null,
					},
					null
				) }
				<DropdownSeparator />
				<DropdownLabel>{ translate( 'By Month' ) }</DropdownLabel>
				{ dateFilters.map( function( { count, title, value }, index ) {
					let analyticsEvent = 'Current Month';

					if ( 1 === index ) {
						analyticsEvent = '1 Month Before';
					} else if ( 1 < index ) {
						analyticsEvent = index + ' Months Before';
					}

					return this.renderDatePicker( index, title, value, count, analyticsEvent );
				}, this ) }
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

	renderDatePicker( titleKey, titleTranslated, value, count, analyticsEvent ) {
		const currentDate = this.props.filter.date;
		const isSelected = isEqual( currentDate, value );
		analyticsEvent = 'undefined' === typeof analyticsEvent ? titleKey : analyticsEvent;

		return (
			<DropdownItem
				key={ titleKey }
				selected={ isSelected }
				onClick={ this.getDatePopoverItemClickHandler( analyticsEvent, value ) }
				count={ count }
			>
				{ titleTranslated }
			</DropdownItem>
		);
	}

	renderAppsPopover() {
		const { appFilters, filter, translate } = this.props;
		const selectedFilter = find( appFilters, { value: filter.app } );
		const selectedText = selectedFilter ? selectedFilter.title : translate( 'All Apps' );

		return (
			<SelectDropdown
				selectedText={ selectedText }
				onClick={ this.handleAppsPopoverLinkClick }
				className="billing-history__transactions-header-select-dropdown"
			>
				<DropdownLabel>{ translate( 'App Name' ) }</DropdownLabel>
				{ this.renderAppPicker( translate( 'All Apps' ), 'all' ) }
				{ appFilters.map( function( { title, value, count } ) {
					return this.renderAppPicker( title, value, count, 'Specific App' );
				}, this ) }
			</SelectDropdown>
		);
	}

	renderAppPicker( title, app, count, analyticsEvent ) {
		const selected = app === this.props.filter.app;

		return (
			<DropdownItem
				key={ app }
				selected={ selected }
				onClick={ this.getAppPopoverItemClickHandler( analyticsEvent, app ) }
				count={ count }
			>
				{ title }
			</DropdownItem>
		);
	}
}

TransactionsHeader.propTypes = {
	//connected props
	appFilters: PropTypes.array.isRequired,
	dateFilters: PropTypes.array.isRequired,
	filter: PropTypes.object.isRequired,
	//own props
	transactionType: PropTypes.string.isRequired,
};

export default connect(
	( state, { transactionType } ) => ( {
		appFilters: getBillingTransactionAppFilterValues( state, transactionType ),
		dateFilters: getBillingTransactionDateFilterValues( state, transactionType ),
		filter: getBillingTransactionFilters( state, transactionType ),
	} ),
	{
		recordGoogleEvent,
		setApp,
		setDate,
	}
)( localize( TransactionsHeader ) );
