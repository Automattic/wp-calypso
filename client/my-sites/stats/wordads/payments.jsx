import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryWordadsPayments from 'calypso/components/data/query-wordads-payments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordAdsPayments } from 'calypso/state/wordads/payments/selectors';

class WordAdsPayments extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		payments: PropTypes.array,
	};

	state = {};

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

	paymentsTable( payments, type ) {
		const { numberFormat, translate } = this.props;
		const rows = [];

		payments.forEach( ( payment ) => {
			rows.push(
				<tr key={ type + '-' + payment.id }>
					<td className="wordads__payments-history-value">
						{ this.swapYearMonth( payment.payment_date ) }
					</td>
					<td className="wordads__payments-history-value">
						${ numberFormat( payment.amount, 2 ) }
					</td>
					<td className="wordads__payments-history-value">{ payment.status }</td>
					<td className="wordads__payments-history-value">{ payment.paypal_email }</td>
					<td className="wordads__payments-history-value">{ payment.description }</td>
				</tr>
			);
		} );

		return (
			<Card>
				<div className="wordads__module-content module-content">
					<table>
						<thead>
							<tr>
								<th className="wordads__payments-history-header">
									{ translate( 'Payment Date' ) }
								</th>
								<th className="wordads__payments-history-header">{ translate( 'Amount' ) }</th>
								<th className="wordads__payments-history-header">{ translate( 'Status' ) }</th>
								<th className="wordads__payments-history-header">
									{ translate( 'PayPal email ' ) }
								</th>
								<th className="wordads__payments-history-header">{ translate( 'Description' ) }</th>
							</tr>
						</thead>
						<tbody>{ rows }</tbody>
					</table>
				</div>
			</Card>
		);
	}

	render() {
		const { siteId, payments, translate } = this.props;
		return (
			<div>
				<QueryWordadsPayments siteId={ siteId } />
				{ payments && this.checkSize( payments )
					? this.paymentsTable( payments, translate( 'payments history' ), 'wordads' )
					: null }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		payments: getWordAdsPayments( state, siteId ),
	};
} )( localize( WordAdsPayments ) );
