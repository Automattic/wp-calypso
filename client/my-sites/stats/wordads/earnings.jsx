import { Card, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryWordadsEarnings from 'calypso/components/data/query-wordads-earnings';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordAdsEarnings } from 'calypso/state/wordads/earnings/selectors';
import './earnings.scss';

class WordAdsEarnings extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		earnings: PropTypes.object,
	};

	state = {
		showEarningsNotice: false,
		showWordadsInfo: false,
		showSponsoredInfo: false,
		showAdjustmentInfo: false,
	};

	handleEarningsNoticeToggle = ( event ) => {
		event.preventDefault();
		this.setState( {
			showEarningsNotice: ! this.state.showEarningsNotice,
		} );
	};

	handleInfoToggle = ( type ) => ( event ) => {
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

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	payoutNotice() {
		const { earnings, numberFormat, translate } = this.props;
		const owed =
			earnings && earnings.total_amount_owed
				? numberFormat( earnings.total_amount_owed, { decimals: 2 } )
				: '0.00';
		const notice = translate(
			'Outstanding amount of $%(amountOwed)s does not exceed the minimum $100 needed to make the payment. ' +
				'Payment will be made as soon as the total outstanding amount has reached $100.',
			{
				comment: 'Insufficient balance for payout.',
				args: { amountOwed: owed },
			}
		);
		const payout = translate(
			'Outstanding amount of $%(amountOwed)s will be paid approximately 45 days following the end of the month in which it was earned.',
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
		const { earnings, numberFormat, translate } = this.props;
		const total = earnings && earnings.total_earnings ? Number( earnings.total_earnings ) : 0;
		const owed = earnings && earnings.total_amount_owed ? Number( earnings.total_amount_owed ) : 0;
		const paid = total - owed;

		return (
			<ul className="ads__earnings-breakdown-list">
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Total earnings', { context: 'Sum of earnings' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">
						${ numberFormat( total, { decimals: 2 } ) }
					</span>
				</li>
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Total paid', { context: 'Sum of earnings that have been distributed' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">
						${ numberFormat( paid, { decimals: 2 } ) }
					</span>
				</li>
				<li className="ads__earnings-breakdown-item">
					<span className="ads__earnings-breakdown-label">
						{ translate( 'Outstanding amount', { context: 'Sum earnings left unpaid' } ) }
					</span>
					<span className="ads__earnings-breakdown-value">
						${ numberFormat( owed, { decimals: 2 } ) }
					</span>
				</li>
			</ul>
		);
	}

	earningsTable( earnings, header_text, type ) {
		const { numberFormat, translate } = this.props;
		const rows = [];
		const infoIcon = this.getInfoToggle( type ) ? 'info' : 'info-outline';
		const classes = clsx( 'earnings_history', {
			'is-showing-info': this.getInfoToggle( type ),
		} );

		for ( const period in earnings ) {
			if ( earnings.hasOwnProperty( period ) ) {
				rows.push(
					<tr key={ type + '-' + period }>
						<td className="ads__earnings-history-value">{ this.swapYearMonth( period ) }</td>
						<td className="ads__earnings-history-value">
							${ numberFormat( earnings[ period ].amount, { decimals: 2 } ) }
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
			<>
				<div className="ads__table-header">
					<h3 className="ads__table-header-title">{ header_text }</h3>
					<button
						className="ads__table-header-button"
						aria-label={ translate( 'Show or hide panel information' ) }
						title={ translate( 'Show or hide panel information' ) }
						onClick={ this.handleInfoToggle( type ) }
					>
						<Gridicon icon={ infoIcon } />
					</button>
				</div>
				<Card className={ classes }>
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
			</>
		);
	}

	render() {
		const { siteId, earnings, translate } = this.props;

		return (
			<>
				<QueryWordadsEarnings siteId={ siteId } />

				{ earnings && this.checkSize( earnings.wordads )
					? this.earningsTable( earnings.wordads, translate( 'Earnings history' ), 'wordads' )
					: null }
				{ earnings && this.checkSize( earnings.sponsored )
					? this.earningsTable(
							earnings.sponsored,
							translate( 'Sponsored Content History' ),
							'sponsored'
					  )
					: null }
				{ earnings && this.checkSize( earnings.adjustment )
					? this.earningsTable(
							earnings.adjustment,
							translate( 'Adjustments History' ),
							'adjustment'
					  )
					: null }
			</>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		earnings: getWordAdsEarnings( state, siteId ),
	};
} )( localize( WordAdsEarnings ) );
