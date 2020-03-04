/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import classNames from 'classnames';
import formatCurrency from '@automattic/format-currency';
import { Button } from '@automattic/components';
import { handleRenewNowClick, getRenewalPrice } from 'lib/purchases';
import { getByPurchaseId } from 'state/purchases/selectors';
import QuerySitePurchases from 'components/data/query-site-purchases';

/**
 * Style dependencies
 */
import './style.scss';

class RenewButton extends React.Component {
	static propTypes = {
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		selectedSite: PropTypes.object,
		subscriptionId: PropTypes.number,
		redemptionProduct: PropTypes.object,
		reactivate: PropTypes.bool,
		customLabel: PropTypes.string,
		tracksProps: PropTypes.object,
	};

	static defaultProps = {
		tracksProps: {},
	};

	handleRenew = () => {
		handleRenewNowClick(
			this.props.purchase,
			this.props.selectedSite.slug,
			this.props.tracksProps
		);
	};

	render() {
		const {
			translate,
			purchase,
			selectedSite,
			redemptionProduct,
			reactivate,
			customLabel,
			subscriptionId,
		} = this.props;

		if ( ! subscriptionId ) {
			return null;
		}

		let formattedPrice = '...';
		let loading = true;

		if ( purchase && selectedSite.ID ) {
			const renewalPrice =
				getRenewalPrice( purchase ) + ( redemptionProduct ? redemptionProduct.cost : 0 );
			const currencyCode = purchase.currencyCode;
			formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } );
			loading = false;
		}

		const buttonClasses = classNames( 'renew-button', { 'is-loading': loading } );
		let buttonLabel = translate( 'Renew for {{strong}}%(price)s{{/strong}}', {
			components: { strong: <strong /> },
			args: { price: formattedPrice },
		} );
		if ( reactivate ) {
			buttonLabel = translate( 'Reactivate for {{strong}}%(price)s{{/strong}}', {
				components: { strong: <strong /> },
				args: { price: formattedPrice },
			} );
		} else if ( customLabel ) {
			buttonLabel = customLabel;
		}

		return (
			<React.Fragment>
				{ selectedSite.ID && <QuerySitePurchases siteId={ selectedSite.ID } /> }

				<Button
					compact={ this.props.compact }
					primary={ this.props.primary }
					className={ buttonClasses }
					onClick={ this.handleRenew }
				>
					{ buttonLabel }
				</Button>
			</React.Fragment>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		purchase: getByPurchaseId( state, ownProps.subscriptionId ),
	};
} )( localize( RenewButton ) );
