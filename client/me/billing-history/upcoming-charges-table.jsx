/** @format */
/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import purchasesPaths from 'me/purchases/paths';
import TransactionsTable from './transactions-table';
import { getSiteSlugsForUpcomingTransactions } from 'state/selectors';

class UpcomingChargesTable extends Component {
	static propTypes = {
		// Computed props
		siteSlugs: PropTypes.object.isRequired,
	};

	renderTransaction = transaction => {
		const { translate } = this.props;
		const siteSlug = this.props.siteSlugs[ Number( transaction.blog_id ) ];

		if ( ! siteSlug ) {
			return null;
		}

		return (
			<div className="billing-history__transaction-links">
				<a href={ purchasesPaths.managePurchase( siteSlug, transaction.id ) }>
					{ translate( 'Manage Purchase' ) }
				</a>
			</div>
		);
	};

	render() {
		const { translate } = this.props;
		const emptyTableText = translate(
			'The upgrades on your account will not renew automatically. ' +
				'To manage your upgrades or enable Auto Renew visit {{link}}My Upgrades{{/link}}.',
			{
				components: { link: <a href={ purchasesPaths.purchasesRoot() } /> },
			}
		);
		const noFilterResultsText = translate( 'No upcoming charges found.' );

		return (
			<TransactionsTable
				transactions={ this.props.transactions }
				initialFilter={ { date: { newest: 20 } } }
				emptyTableText={ emptyTableText }
				noFilterResultsText={ noFilterResultsText }
				transactionRenderer={ this.renderTransaction }
			/>
		);
	}
}

export default connect( state => ( {
	siteSlugs: getSiteSlugsForUpcomingTransactions( state ),
} ) )( localize( UpcomingChargesTable ) );
