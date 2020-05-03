/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { managePurchase, purchasesRoot } from 'me/purchases/paths';
import TransactionsTable from './transactions-table';
import getSiteSlugsForUpcomingTransactions from 'state/selectors/get-site-slugs-for-upcoming-transactions';

class UpcomingChargesTable extends Component {
	static propTypes = {
		// Computed props
		siteSlugs: PropTypes.object.isRequired,
	};

	renderTransaction = ( transaction ) => {
		const { translate } = this.props;
		const siteSlug = this.props.siteSlugs[ Number( transaction.blog_id ) ];

		if ( ! siteSlug ) {
			return null;
		}

		return (
			<div className="billing-history__transaction-links">
				<a href={ managePurchase( siteSlug, transaction.id ) }>
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
				components: { link: <a href={ purchasesRoot } /> },
			}
		);
		const noFilterResultsText = translate( 'No upcoming charges found.' );

		return (
			<TransactionsTable
				transactionType="upcoming"
				emptyTableText={ emptyTableText }
				noFilterResultsText={ noFilterResultsText }
				transactionRenderer={ this.renderTransaction }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	siteSlugs: getSiteSlugsForUpcomingTransactions( state ),
} ) )( localize( UpcomingChargesTable ) );
