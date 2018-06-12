/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import notices from 'notices';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Gridicon from 'gridicons';
import WordadsActions from 'lib/ads/actions';
import EarningsStore from 'lib/ads/earnings-store';

class AdsFormEarnings extends Component {
	state = this.getSettingsFromStore();

	componentDidMount() {
		EarningsStore.on( 'change', this.updateSettings );
		this.fetchIfEmpty();
	}

	componentWillUnmount() {
		EarningsStore.removeListener( 'change', this.updateSettings );
	}

	componentDidUpdate() {
		if ( this.state.error && this.state.error.message ) {
			notices.error( this.state.error.message );
		} else {
			notices.clearNotices( 'notices' );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! EarningsStore.getById( nextProps.site.ID ).earnings ) {
			this.resetState();
		}

		if ( this.props.site.ID !== nextProps.site.ID ) {
			this.fetchIfEmpty( nextProps.site );
			this.setState( this.getSettingsFromStore( nextProps.site ) );
		}
	}

	getSettingsFromStore( siteInstance ) {
		const site = siteInstance || this.props.site,
			store = EarningsStore.getById( site.ID ) || {};

		store.showEarningsNotice = false;
		store.showWordadsInfo = false;
		store.showSponsoredInfo = false;
		store.showAdjustmentInfo = false;

		return store;
	}

	resetState() {
		this.setState( {
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
			showAdjustmentInfo: false,
		} );
	}

	fetchIfEmpty( site ) {
		site = site || this.props.site;
		if ( ! site || ! site.ID ) {
			return;
		}

		if ( EarningsStore.getById( site.ID ).earnings ) {
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( () => WordadsActions.fetchEarnings( site ), 0 );
	}

	updateSettings = () => {
		this.setState( this.getSettingsFromStore() );
	};

	handleEarningsNoticeToggle = event => {
		event.preventDefault();
		this.setState( {
			showEarningsNotice: ! this.state.showEarningsNotice,
		} );
	};

	handleInfoToggle = type => event => {
		event.preventDefault();
		switch ( type ) {
			case 'wordads':
				this.setState( {
					showWordadsInfo: ! this.state.showWordadsInfo,
				} );
				break;
			case 'sponsored':
				this.setState( {
					showSponsoredInfo: ! this.state.showSponsoredInfo,
				} );
				break;
			case 'adjustment':
				this.setState( {
					showAdjustmentInfo: ! this.state.showAdjustmentInfo,
				} );
				break;
		}
	};

	getInfoToggle( type ) {
		const types = {
			wordads: this.state.showWordadsInfo,
			sponsored: this.state.showSponsoredInfo,
			adjustment: this.state.showAdjustmentInfo,
		};

		return types[ type ] ? types[ type ] : false;
	}

	checkSize( obj ) {
		if ( ! obj ) {
			return 0;
		}

		return Object.keys( obj ).length;
	}

	swapYearMonth( date ) {
		const splits = date.split( '-' );
		return splits[ 1 ] + '-' + splits[ 0 ];
	}

	getStatus( status ) {
		const { translate } = this.props;
		const statuses = {
			0: {
				name: translate( 'Unpaid' ),
				tooltip: translate( 'Payment is on hold until the end of the current month.' ),
			},
			1: {
				name: translate( 'Paid' ),
				tooltip: translate( 'Payment has been processed through PayPal.' ),
			},
			2: {
				name: translate( 'a8c-only' ),
			},
			3: {
				name: translate( 'Pending (Missing Tax Info)' ),
				tooltip: translate(
					'Payment is pending due to missing information. ' +
						'You can provide tax information in the settings screen.'
				),
			},
			4: {
				name: translate( 'Pending (Invalid PayPal)' ),
				tooltip: translate(
					'Payment processing has failed due to invalid PayPal address. ' +
						'You can correct the PayPal address in the settings screen.'
				),
			},
		};

		return (
			<span title={ statuses[ status ].tooltip ? statuses[ status ].tooltip : '' }>
				{ statuses[ status ] ? statuses[ status ].name : '?' }
			</span>
		);
	}

	payoutNotice() {
		const { translate } = this.props;
		const owed =
				this.state.earnings && this.state.earnings.total_amount_owed
					? this.state.earnings.total_amount_owed
					: '0.00',
			notice = translate(
				'Outstanding amount of $%(amountOwed)s does not exceed the minimum $100 needed to make the payment. ' +
					'Payment will be made as soon as the total outstanding amount has reached $100.',
				{
					comment: 'Insufficient balance for payout.',
					args: { amountOwed: owed },
				}
			),
			payout = translate(
				'Outstanding amount of $%(amountOwed)s will be paid by the last business day of the month.',
				{
					comment: 'Payout will proceed.',
					args: { amountOwed: owed },
				}
			);

		return (
			<div className="ads__module-content-text module-content-text module-content-text-info">
				<p>{ owed < 100 ? notice : payout }</p>
			</div>
		);
	}

	infoNotice() {
		const { translate } = this.props;

		return (
			<div className="ads__module-content-text module-content-text module-content-text-info">
				<p>
					{ translate(
						'{{strong}}Ads Served{{/strong}} is the number of ads we attempted to display on your site ' +
							'(page impressions x available ad slots).',
						{ components: { strong: <strong /> } }
					) }
				</p>

				<p>
					{ translate(
						'Not every ad served will result in a paid impression. This can happen when:'
					) }
				</p>

				<ul className="ads__earnings-history-info-list">
					<li className="ads__earnings-history-info">
						{ translate( 'A visitor is using an ad blocker, preventing ads from showing.' ) }
					</li>
					<li className="ads__earnings-history-info">
						{ translate(
							'A visitor leaves your site before ads can fully load in their browser.'
						) }
					</li>
					<li className="ads__earnings-history-info">
						{ translate(
							'There were no advertisers who bid higher than the minimum price required to display their ad.'
						) }
					</li>
				</ul>

				<hr />

				<p>
					<em>
						{ translate( 'Earnings fluctuate based on real-time bidding from advertisers.' ) }
					</em>
				</p>
			</div>
		);
	}

	earningsBreakdown() {
		const { numberFormat, translate } = this.props;
		const earnings =
				this.state.earnings && this.state.earnings.total_earnings
					? Number( this.state.earnings.total_earnings )
					: 0,
			owed =
				this.state.earnings && this.state.earnings.total_amount_owed
					? Number( this.state.earnings.total_amount_owed )
					: 0,
			paid =
				this.state.earnings &&
				this.state.earnings.total_earnings &&
				this.state.earnings.total_amount_owed
					? this.state.earnings.total_earnings - this.state.earnings.total_amount_owed
					: 0;

		return (
			<ul className="ads__earnings-breakdown-list">
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">${ numberFormat( earnings, 2 ) }</span>
				</li>
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Total paid', { context: 'Sum of earnings that have been distributed' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">${ numberFormat( paid, 2 ) }</span>
				</li>
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Outstanding amount', { context: 'Sum earnings left unpaid' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">${ numberFormat( owed, 2 ) }</span>
				</li>
			</ul>
		);
	}

	earningsTable( earnings, header_text, type ) {
		const { numberFormat, translate } = this.props;
		const rows = [],
			infoIcon = this.getInfoToggle( type ) ? 'info' : 'info-outline',
			classes = classNames( 'earnings_history', {
				'is-showing-info': this.getInfoToggle( type ),
			} );

		for ( const period in earnings ) {
			if ( earnings.hasOwnProperty( period ) ) {
				rows.push(
					<tr key={ type + '-' + period }>
						<td className="ads__earnings-history-value">{ this.swapYearMonth( period ) }</td>
						<td className="ads__earnings-history-value">
							${ numberFormat( earnings[ period ].amount, 2 ) }
						</td>
						<td className="ads__earnings-history-value">
							{ numberFormat( earnings[ period ].pageviews ) }
						</td>
						<td className="ads__earnings-history-value">
							{ this.getStatus( earnings[ period ].status ) }
						</td>
					</tr>
				);
			}
		}

		return (
			<Card className={ classes }>
				<div className="ads__module-header module-header">
					<h1 className="ads__module-header-title module-header-title">{ header_text }</h1>
					<ul className="ads__module-header-actions module-header-actions">
						<li className="ads__module-header-action module-header-action toggle-info">
							<a
								href="#"
								className="ads__module-header-action-link module-header-action-link"
								aria-label={ translate( 'Show or hide panel information' ) }
								title={ translate( 'Show or hide panel information' ) }
								onClick={ this.handleInfoToggle( type ) }
							>
								<Gridicon icon={ infoIcon } />
							</a>
						</li>
					</ul>
				</div>
				<div className="ads__module-content module-content">
					{ this.infoNotice() }
					<table>
						<thead>
							<tr>
								<th className="ads__earnings-history-header">{ translate( 'Period' ) }</th>
								<th className="ads__earnings-history-header">{ translate( 'Earnings' ) }</th>
								<th className="ads__earnings-history-header">{ translate( 'Ads Served' ) }</th>
								<th className="ads__earnings-history-header">{ translate( 'Status' ) }</th>
							</tr>
						</thead>
						<tbody>{ rows }</tbody>
					</table>
				</div>
			</Card>
		);
	}

	render() {
		const { translate } = this.props;
		const infoIcon = this.state.showEarningsNotice ? 'info' : 'info-outline',
			classes = classNames( 'earnings_breakdown', {
				'is-showing-info': this.state.showEarningsNotice,
			} );

		return (
			<div>
				<Card className={ classes }>
					<div className="ads__module-header module-header">
						<h1 className="ads__module-header-title module-header-title">
							{ translate( 'Totals' ) }
						</h1>
						<ul className="ads__module-header-actions module-header-actions">
							<li className="ads__module-header-action module-header-action toggle-info">
								<a
									href="#"
									className="ads__module-header-action-link module-header-action-link"
									aria-label={ translate( 'Show or hide panel information' ) }
									title={ translate( 'Show or hide panel information' ) }
									onClick={ this.handleEarningsNoticeToggle }
								>
									<Gridicon icon={ infoIcon } />
								</a>
							</li>
						</ul>
					</div>
					<div className="ads__module-content module-content">
						{ this.payoutNotice() }
						{ this.earningsBreakdown() }
					</div>
				</Card>
				{ this.state.earnings && this.checkSize( this.state.earnings.wordads )
					? this.earningsTable(
							this.state.earnings.wordads,
							translate( 'Earnings History' ),
							'wordads'
					  )
					: null }
				{ this.state.earnings && this.checkSize( this.state.earnings.sponsored )
					? this.earningsTable(
							this.state.earnings.sponsored,
							translate( 'Sponsored Content History' ),
							'sponsored'
					  )
					: null }
				{ this.state.earnings && this.checkSize( this.state.earnings.adjustment )
					? this.earningsTable(
							this.state.earnings.adjustment,
							translate( 'Adjustments History' ),
							'adjustment'
					  )
					: null }
			</div>
		);
	}
}

export default localize( AdsFormEarnings );
