/**
 * External dependencies
 */
var React = require( 'react' ),
	notices = require( 'notices' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:my-sites:ads-earnings' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' ),
	WordadsActions = require( 'lib/ads/actions' ),
	EarningsStore = require( 'lib/ads/earnings-store' );

module.exports = React.createClass( {

	displayName: 'AdsFormEarnings',

	componentWillMount: function() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
		EarningsStore.on( 'change', this.updateSettings );
		this._fetchIfEmpty();
	},

	componentWillUnmount: function() {
		EarningsStore.removeListener( 'change', this.updateSettings );
	},

	updateSettings: function() {
		this.setState( this.getSettingsFromStore() );
	},

	componentDidUpdate: function() {
		if ( this.state.error && this.state.error.message ) {
			notices.error( this.state.error.message );
		} else {
			notices.clearNotices( 'notices' );
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! EarningsStore.getById( nextProps.site.ID ).earnings ) {
			this.resetState();
		}

		if ( this.props.site.ID !== nextProps.site.ID ) {
			this._fetchIfEmpty( nextProps.site );
			this.setState( this.getSettingsFromStore( nextProps.site ) );
		}
	},

	getInitialState: function() {
		return this.getSettingsFromStore();
	},

	getSettingsFromStore: function( siteInstance ) {
		var site = siteInstance || this.props.site,
			store = EarningsStore.getById( site.ID ) || {};

		store.showEarningsNotice = false;
		store.showWordadsInfo = false;
		store.showSponsoredInfo = false;
		store.showAdjustmentInfo = false;

		return store;
	},

	resetState: function() {
		this.replaceState( {
			earnings: {
				adjustment: {},
				sponsored: {},
				wordads: {},
				total_amount_owed: '0.00',
				total_earnings: '0.00',
			},
			isLoading: false,
			error: {},
			showEarningsNotice: false,
			showWordadsInfo: false,
			showSponsoredInfo: false,
			showAdjustmentInfo: false
		} );
	},

	_fetchIfEmpty: function( site ) {
		var site = site || this.props.site;
		if ( ! site || ! site.ID ) {
			return;
		}

		if ( EarningsStore.getById( site.ID ).earnings ) {
			debug( 'initial fetch not necessary' );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( function() {
			WordadsActions.fetchEarnings( site )
		}, 0 );
	},

	toggleEarningsNotice: function( event ) {
		event.preventDefault();
		this.setState( { showEarningsNotice: ! this.state.showEarningsNotice } );
	},

	toggleInfo: function( type, event ) {
		event.preventDefault();
		switch ( type ) {
			case 'wordads':
				this.setState( { showWordadsInfo: ! this.state.showWordadsInfo } );
				break;
			case 'sponsored':
				this.setState( { showSponsoredInfo: ! this.state.showSponsoredInfo } );
				break;
			case 'adjustment':
				this.setState( { showAdjustmentInfo: ! this.state.showAdjustmentInfo } );
				break;
		}
	},

	getInfoToggle: function( type ) {
		var types = {
			wordads: this.state.showWordadsInfo,
			sponsored: this.state.showSponsoredInfo,
			adjustment: this.state.showAdjustmentInfo,
		}

		return types[ type ] ? types[ type ] : false;
	},

	checkSize: function( obj ) {
		if ( ! obj ) {
			return 0;
		}

		return Object.keys( obj ).length;
	},

	swapYearMonth: function( date ) {
		var splits = date.split( '-' );
		return splits[1] + '-' + splits[0];
	},

	getStatus: function( status ) {
		var statuses = {
			0: this.translate( 'Unpaid' ),
			1: this.translate( 'Paid' ),
			2: this.translate( 'a8c-only' ),
			3: this.translate( 'Pending (Missing Tax Info)' ),
			4: this.translate( 'Pending (Invalid PayPal)' )
		}

		return statuses[ status ] ? statuses[ status ] : '?';
	},

	payoutNotice: function() {
		var owed = this.state.earnings && this.state.earnings.total_amount_owed ? this.state.earnings.total_amount_owed : '0.00',
			notice = this.translate(
				'Outstanding amount of $%(amountOwed)s does not exceed the minimum $100 needed to make the payment. Payment will be made as soon as the total outstanding amount has reached $100.',
				{
					comment: 'Insufficient balance for payout.',
					args: { amountOwed: owed }
				}
			),
			payout = this.translate(
				'Outstanding amount of $%(amountOwed)s will be paid by the last business day of the month.',
				{
					comment: 'Payout will proceed.',
					args: { amountOwed: owed }
				}
			);

		return (
			<div className="module-content-text module-content-text-info">
				<p>{ owed < 100 ? notice : payout }</p>
			</div>
		);
	},

	infoNotice: function() {
		return (
			<div className="module-content-text module-content-text-info">
				<p>{ this.translate( 'Payments can have the following statuses:' ) }</p>
				<ul className="earnings_history__statuses-list">
					<li className="earnings_history__status"><strong>{ this.translate( 'Unpaid:' ) } </strong>
						{ this.translate( 'Payment is on hold until the end of the current month.' ) }
					</li>
					<li className="earnings_history__status"><strong>{ this.translate( 'Paid:' ) } </strong>
						{ this.translate( 'Payment has been processed through PayPal.' ) }
					</li>
					<li className="earnings_history__status"><strong>{ this.translate( 'Pending (Missing Tax Info):' ) } </strong>
						{ this.translate( 'Payment is pending due to missing information. You can provide tax information in the settings screen.' ) }
					</li>
					<li className="earnings_history__status"><strong>{ this.translate( 'Pending (Invalid PayPal):' ) } </strong>
						{ this.translate( 'Payment processing has failed due to invalid PayPal address. You can correct the PayPal address in the settings screen.' ) }
					</li>
				</ul>
			</div>
		);
	},

	earningsBreakdown: function() {
		var earnings = this.state.earnings && this.state.earnings.total_earnings ? Number( this.state.earnings.total_earnings ) : 0,
			owed = this.state.earnings && this.state.earnings.total_amount_owed ? Number( this.state.earnings.total_amount_owed ) : 0,
			paid = this.state.earnings && this.state.earnings.total_earnings && this.state.earnings.total_amount_owed ?
				( this.state.earnings.total_earnings - this.state.earnings.total_amount_owed ) : 0;

		return (
			<ul className="earnings_breakdown__list" >
				<li className="earnings_breakdown__item">
					<span className="earnings_breakdown__label">{ this.translate( 'Total earnings', { context: 'Sum of earnings' } ) }</span>
					<span className="earnings_breakdown__value">${ this.numberFormat( earnings, 2 ) }</span>
				</li>
				<li className="earnings_breakdown__item">
					<span className="earnings_breakdown__label">{ this.translate( 'Total paid', { context: 'Sum of earnings that have been distributed' } ) }</span>
					<span className="earnings_breakdown__value">${ this.numberFormat( paid, 2 ) }</span>
				</li>
				<li className="earnings_breakdown__item">
					<span className="earnings_breakdown__label">{ this.translate( 'Outstanding amount', { context: 'Sum earnings left unpaid' } ) }</span>
					<span className="earnings_breakdown__value">${ this.numberFormat( owed, 2 ) }</span>
				</li>
			</ul>
		);
	},

	earningsTable: function( earnings, header_text, type ) {
		var period,
			rows = [],
			infoIcon = this.getInfoToggle( type ) ? 'info' : 'info-outline',
			classes = classNames( 'earnings_history', {
				'is-showing-info': this.getInfoToggle( type )
			} );

		for ( period in earnings ) {
			if ( earnings.hasOwnProperty( period ) ) {
				rows.push(
					<tr key={ type + '-' + period }>
						<td className="earnings-history__value">{ this.swapYearMonth( period ) }</td>
						<td className="earnings-history__value">${ this.numberFormat( earnings[period].amount, 2 ) }</td>
						<td className="earnings-history__value">{ earnings[period].pageviews }</td>
						<td className="earnings-history__value">{ this.getStatus( earnings[period].status ) }</td>
					</tr>
				);
			}
		}

		return (
			<Card className={ classes }>
				<div className="module-header">
					<h1 className="module-header-title">{ header_text }</h1>
					<ul className="module-header-actions">
						<li className="module-header-action toggle-info">
							<a href="#"
								className="module-header-action-link"
								aria-label={ this.translate( 'Show or hide panel information' ) }
								title={ this.translate( 'Show or hide panel information' ) }
								onClick={ this.toggleInfo.bind( this, type ) }>
								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<div className="module-content">
					{ this.infoNotice() }
					<table>
						<thead>
							<tr>
								<th className="earnings-history__header">{ this.translate( 'Period' ) }</th>
								<th className="earnings-history__header">{ this.translate( 'Earnings' ) }</th>
								<th className="earnings-history__header">{ this.translate( 'Ad Impressions' ) }</th>
								<th className="earnings-history__header">{ this.translate( 'Status' ) }</th>
							</tr>
						</thead>
						<tbody>
							{ rows }
						</tbody>
					</table>
				</div>
			</Card>
		);
	},

	render: function() {
		var infoIcon = this.state.showEarningsNotice ? 'info' : 'info-outline',
			classes = classNames( 'earnings_breakdown', {
				'is-showing-info': this.state.showEarningsNotice
			} );

		return (
			<div>
				<Card className={ classes }>
					<div className="module-header">
						<h1 className="module-header-title">{ this.translate( 'Totals' ) }</h1>
						<ul className="module-header-actions">
							<li className="module-header-action toggle-info">
								<a href="#"
									className="module-header-action-link"
									aria-label={ this.translate( 'Show or hide panel information' ) }
									title={ this.translate( 'Show or hide panel information' ) }
									onClick={ this.toggleEarningsNotice } >
									<Gridicon icon={ infoIcon } />
								</a>
							</li>
						</ul>
					</div>
					<div className="module-content">
						{ this.payoutNotice() }
						{ this.earningsBreakdown() }
					</div>
				</Card>
				{ this.state.earnings && this.checkSize( this.state.earnings.wordads ) ?
					this.earningsTable( this.state.earnings.wordads, this.translate( 'Earnings History' ), 'wordads' ) :
					null
				}
				{ this.state.earnings && this.checkSize( this.state.earnings.sponsored ) ?
					this.earningsTable( this.state.earnings.sponsored, this.translate( 'Sponsored Content History' ), 'sponsored' ) :
					null
				}
				{ this.state.earnings && this.checkSize( this.state.earnings.adjustment ) ?
					this.earningsTable( this.state.earnings.adjustment, this.translate( 'Adjustments History' ), 'adjustment' ) :
					null
				}
			</div>
		);
	}
} );
