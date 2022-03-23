import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Badge from 'calypso/components/badge';
import QueryWordadsPayments from 'calypso/components/data/query-wordads-payments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordAdsPayments } from 'calypso/state/wordads/payments/selectors';

class WordAdsPayments extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		payments: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.number.isRequired,
				payment_date: PropTypes.string,
				amount: PropTypes.string,
				status: PropTypes.string,
				paypal_email: PropTypes.string.isRequired,
				description: PropTypes.string,
			} )
		).isRequired,
	};

	state = {};

	checkSize( obj ) {
		if ( ! obj ) {
			return 0;
		}

		return Object.keys( obj ).length;
	}

	statusToType( status ) {
		const map = {
			paid: 'success',
			pending: 'info',
			failed: 'warning',
		};
		return map[ status ] || 'error';
	}

	paymentsTable( payments, type ) {
		const { numberFormat, translate } = this.props;
		const rows = [];

		payments.forEach( ( payment ) => {
			rows.push(
				<tr key={ type + '-' + payment.id }>
					<td className="ads__payments-history-value">{ payment.payment_date }</td>
					<td className="ads__payments-history-value">${ numberFormat( payment.amount, 2 ) }</td>
					<td className="ads__payments-history-value">
						<Badge
							className="ads__payments-history-badge"
							type={ this.statusToType( payment.status ) }
						>
							{ payment.status }
						</Badge>
					</td>
					<td className="ads__payments-history-value">{ payment.paypal_email }</td>
					<td className="ads__payments-history-value">{ payment.description }</td>
				</tr>
			);
		} );

		return (
			<Card>
				<div className="ads__module-content module-content">
					<table>
						<thead>
							<tr>
								<th className="ads__payments-history-header">{ translate( 'Payment Date' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Amount' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Status' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'PayPal email ' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Description' ) }</th>
							</tr>
						</thead>
						<tbody>{ rows }</tbody>
					</table>
				</div>
			</Card>
		);
	}

	render() {
		const { siteId, payments } = this.props;
		return (
			<div>
				<QueryWordadsPayments siteId={ siteId } />
				{ payments && this.checkSize( payments )
					? this.paymentsTable( payments, 'wordads' )
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
