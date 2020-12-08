/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import classNames from 'classnames';
import formatCurrency from '@automattic/format-currency';
import { Button } from '@automattic/components';
import { handleRenewNowClick, getRenewalPrice } from 'calypso/lib/purchases';

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
		purchase: PropTypes.object,
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
		let buttonLabel = translate( 'Renew now for {{strong}}%(price)s{{/strong}}', {
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

export default localize( RenewButton );
