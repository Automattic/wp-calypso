import { Badge, Card } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryWordadsPayments from 'calypso/components/data/query-wordads-payments';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';
import Notice from 'calypso/components/notice';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { getWordadsSettings } from 'calypso/state/selectors/get-wordads-settings';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getWordAdsPayments } from 'calypso/state/wordads/payments/selectors';

class WordAdsPayments extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		payments: PropTypes.arrayOf(
			PropTypes.shape( {
				id: PropTypes.number.isRequired,
				paymentDate: PropTypes.string,
				amount: PropTypes.string,
				status: PropTypes.string,
				paypalEmail: PropTypes.string.isRequired,
				description: PropTypes.string,
			} )
		),
	};

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
			failed: 'error',
		};
		return map[ status ] || 'warning';
	}

	paymentsTable( payments, type ) {
		const { numberFormat, translate } = this.props;
		const rows = [];
		const classes = classNames( 'payments_history' );

		payments.forEach( ( payment ) => {
			rows.push(
				<tr key={ type + '-' + payment.id }>
					<td className="ads__payments-history-value">
						{ payment.status === 'pending' ? (
							<small>
								{ translate( 'Estimated' ) }: { payment.paymentDate }
							</small>
						) : (
							payment.paymentDate
						) }
					</td>
					<td className="ads__payments-history-value">${ numberFormat( payment.amount, 2 ) }</td>
					<td className="ads__payments-history-value">
						<Badge
							className="ads__payments-history-badge"
							type={ this.statusToType( payment.status ) }
						>
							{ payment.status }
						</Badge>
					</td>
					<td className="ads__payments-history-value">{ payment.paypalEmail }</td>
					<td className="ads__payments-history-value">{ payment.description }</td>
				</tr>
			);
		} );

		return (
			<Card className={ classes }>
				<div className="ads__module-header module-header">
					<h1 className="ads__module-header-title module-header-title">
						{ translate( 'Payments history' ) }
					</h1>
				</div>
				<div className="ads__module-content module-content">
					<table>
						<thead>
							<tr>
								<th className="ads__payments-history-header">{ translate( 'Payment Date' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Amount' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Status' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'PayPal' ) }</th>
								<th className="ads__payments-history-header">{ translate( 'Description' ) }</th>
							</tr>
						</thead>
						<tbody>{ rows }</tbody>
					</table>
				</div>
			</Card>
		);
	}

	notices( payments, wordAdsSettings ) {
		const { translate } = this.props;

		if ( ! payments || ! wordAdsSettings ) {
			return null;
		}

		if ( ! wordAdsSettings.paypal ) {
			return null;
		}

		let hasMismatch = false;

		payments.forEach( ( payment ) => {
			if ( payment.status === 'pending' && payment.paypalEmail !== wordAdsSettings.paypal ) {
				hasMismatch = true;
			}
		} );

		return hasMismatch ? (
			<Notice
				classname="ads__activate-notice"
				status="is-warning"
				showDismiss={ false }
				text={ translate(
					'Your pending payment will be sent to a PayPal address different from your current address. Please {{contactSupportLink}}contact support{{/contactSupportLink}} if you need to change the PayPal address of your pending payment.',
					{
						components: {
							contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						},
					}
				) }
			/>
		) : null;
	}

	empty() {
		const { translate } = this.props;

		return (
			<Card>
				{ translate(
					'You have no payments history. Payment will be made as soon as the total outstanding amount has reached $100.'
				) }
			</Card>
		);
	}

	render() {
		const { siteId, payments, wordAdsSettings } = this.props;
		return (
			<div>
				<QueryWordadsSettings siteId={ siteId } />
				<QueryWordadsPayments siteId={ siteId } />
				{ this.notices( payments, wordAdsSettings ) }
				{ payments && payments.length > 0
					? this.paymentsTable( payments, 'wordads' )
					: this.empty() }
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
		wordAdsSettings: getWordadsSettings( state, siteId ),
	};
} )( localize( WordAdsPayments ) );
