/**
 * External dependencies
 */
var React = require( 'react' ),
	uniq = require( 'lodash/uniq' ),
	map = require( 'lodash/map' ),
	range = require( 'lodash/range' ),
	closest = require( 'component-closest' ),
	last = require( 'lodash/last' ),
	classNames = require( 'classnames' );
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
var tableRows = require( './table-rows' ),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {
	displayName: 'TransactionsHeader',

	mixins: [ eventRecorder ],

	getInitialState: function() {
		return {
			activePopover: '',
			searchValue: ''
		};
	},

	preventEnterKeySubmission: function( event ) {
		event.preventDefault();
	},

	componentWillMount: function() {
		document.body.addEventListener( 'click', this.closePopoverIfClickedOutside );
	},

	componentWillUnmount: function() {
		document.body.removeEventListener( 'click', this.closePopoverIfClickedOutside );
	},

	closePopoverIfClickedOutside: function( event ) {
		if ( closest( event.target, 'thead' ) ) {
			return;
		}

		this.setState( { activePopover: '' } );
	},

	render: function() {
		return (
			<thead>
				<tr className="billing-history__header-row">
					<th className="billing-history__date billing-history__header-column">{ this.renderDatePopover() }</th>
					<th className="billing-history__trans-app billing-history__header-column">{ this.renderAppsPopover() }</th>
					<th className="billing-history__search-field billing-history__header-column" />
				</tr>
			</thead>
		);
	},

	setFilter: function( filter ) {
		this.setState( { activePopover: '' } );
		this.props.onNewFilter( filter );
	},

	renderDatePopover: function() {
		var isVisible = ( 'date' === this.state.activePopover ),
			classes = classNames( {
				'filter-popover': true,
				'is-popped': isVisible
			} ),
			previousMonths = range( 6 ).map( function( n ) {
				return this.moment().subtract( n, 'months' );
			}, this ),
			monthPickers = previousMonths.map( function( month, index ) {
				var analyticsEvent = 'Current Month';

				if ( 1 === index ) {
					analyticsEvent = '1 Month Before';
				} else if ( 1 < index ) {
					analyticsEvent = index + ' Months Before';
				}

				return this.renderDatePicker( month.format( 'MMM YYYY' ), month.format( 'MMM YYYY' ), { month: month }, analyticsEvent );
			}, this );

		return (
			<div className={ classes }>
				<strong
					className="filter-popover-toggle date-toggle"
					onClick={ this.recordClickEvent( 'Toggle Date Popover in Billing History', this.togglePopover.bind( this, 'date' ) ) }
				>
					{ this.translate( 'Date' ) }
					<Gridicon icon="chevron-down" size={ 18 } />
				</strong>
				<div className="filter-popover-content datepicker">
					<div className="overflow">
						<table>
							<thead>
								<tr>
									<th colSpan="2">{ this.translate( 'Recent Transactions' ) }</th>
								</tr>
							</thead>
							<tbody>
								{ this.renderDatePicker( '5 Newest', this.translate( '5 Newest' ), { newest: 5 } ) }
								{ this.renderDatePicker( '10 Newest', this.translate( '10 Newest' ), { newest: 10 } ) }
							</tbody>
							<thead>
								<tr>
									<th>{ this.translate( 'By Month' ) }</th>
									<th className="transactions-header__count">{ this.translate( 'Transactions' ) }</th>
								</tr>
							</thead>
							<tbody>
								{ monthPickers }
								{ this.renderDatePicker( 'Older', this.translate( 'Older' ), { before: last( previousMonths ) } ) }
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	},

	togglePopover: function( name ) {
		var activePopover;
		if ( this.state.activePopover === name ) {
			activePopover = '';
		} else {
			activePopover = name;
		}

		this.setState( { activePopover: activePopover } );
	},

	renderDatePicker: function( titleKey, titleTranslated, date, analyticsEvent ) {
		var filter = { date: date },
			isSelected, classes;

		var currentDate = this.props.filter.date || {};

		if ( date.newest ) {
			isSelected = date.newest === currentDate.newest;
		} else if ( date.month && currentDate.month ) {
			isSelected = date.month.isSame( currentDate.month, 'month' );
		} else if ( date.before ) {
			isSelected = Boolean( currentDate.before );
		} else {
			isSelected = false;
		}

		classes = classNames( {
			'transactions-header__date-picker': true,
			selected: isSelected
		} );

		analyticsEvent = 'undefined' === typeof analyticsEvent ? titleKey : analyticsEvent;

		return (
			<tr key={ titleKey } className={ classes } onClick={ this.recordClickEvent( 'Date Popover Item: ' + analyticsEvent, this.handlePickerSelection.bind( this, filter ) ) }>
				<td className="descriptor">{ titleTranslated }</td>
				<td className="transactions-header__count">{ date.newest ? '' : this.getFilterCount( filter ) }</td>
			</tr>
		);
	},

	handlePickerSelection: function( filter ) {
		this.setFilter( filter );
		this.setState( { searchValue: '' } );
	},

	getFilterCount: function( filter ) {
		if ( ! this.props.transactions ) {
			return;
		}

		return tableRows.filter( this.props.transactions, filter ).length;
	},

	renderAppsPopover: function() {
		var isVisible = ( 'apps' === this.state.activePopover ),
			classes = classNames( {
				'filter-popover': true,
				'is-popped': isVisible
			} ),
			appPickers = this.getApps().map( function( app ) {
				return this.renderAppPicker( app, app, 'Specific App' );
			}, this );

		return (
			<div className={ classes }>
				<strong
					className="filter-popover-toggle app-toggle"
					onClick={ this.recordClickEvent( 'Toggle Apps Popover in Billing History', this.togglePopover.bind( this, 'apps' ) ) }>
					{ this.translate( 'All Apps' ) }
					<Gridicon icon="chevron-down" size={ 18 } />
				</strong>
				<div className="filter-popover-content app-list">
					<table>
						<thead>
							<tr>
								<th>{ this.translate( 'App Name' ) }</th>
								<th>{ this.translate( 'Transactions' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderAppPicker( this.translate( 'All Apps' ), 'all' ) }
							{ appPickers }
						</tbody>
					</table>
				</div>
			</div>
		);
	},

	getApps: function() {
		return uniq( map( this.props.transactions, 'service' ) );
	},

	renderAppPicker: function( title, app, analyticsEvent ) {
		var filter = { app: app },
			classes = classNames( {
				'app-picker': true,
				selected: app === this.props.filter.app
			} );

		return (
			<tr key={app} className={classes} onClick={ this.recordClickEvent( 'App Popover Item: ' + analyticsEvent, this.handlePickerSelection.bind( this, filter ) ) }>
				<td className="descriptor">{ title }</td>
				<td className="transactions-header__count">{ this.getFilterCount( filter ) }</td>
			</tr>
		);
	}
} );
