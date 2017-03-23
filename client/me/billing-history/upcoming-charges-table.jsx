/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal Dependencies
 */
var purchasesPaths = require('me/purchases/paths'),
    TransactionsTable = require('./transactions-table');

module.exports = React.createClass({
    displayName: 'UpcomingChargesTable',

    propTypes: {
        sites: PropTypes.shape({
            getSite: PropTypes.func.isRequired,
        }).isRequired,
    },

    render: function() {
        var transactions = null;
        const emptyTableText = this.translate(
            'The upgrades on your account will not renew automatically. ' +
                'To manage your upgrades or enable Auto Renew visit {{link}}My Upgrades{{/link}}.',
            {
                components: { link: <a href={purchasesPaths.purchasesRoot()} /> },
            }
        );
        const noFilterResultsText = this.translate('No upcoming charges found.');

        if (this.props.sites.initialized) {
            // `TransactionsTable` will render a loading state until the transactions are present
            transactions = this.props.transactions;
        }

        return (
            <TransactionsTable
                transactions={transactions}
                initialFilter={{ date: { newest: 20 } }}
                emptyTableText={emptyTableText}
                noFilterResultsText={noFilterResultsText}
                transactionRenderer={this.renderTransaction}
            />
        );
    },

    renderTransaction: function(transaction) {
        var site = this.props.sites.getSite(Number(transaction.blog_id));

        if (!site) {
            return null;
        }

        return (
            <div className="transaction-links">
                <a href={purchasesPaths.managePurchase(site.slug, transaction.id)}>
                    {this.translate('Manage Purchase')}
                </a>
            </div>
        );
    },
});
