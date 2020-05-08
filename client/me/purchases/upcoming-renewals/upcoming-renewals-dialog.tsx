/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getName, getRenewalPrice, purchaseType, isExpired } from 'lib/purchases';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import { Button, Dialog } from '@automattic/components';
import { useLocalizedMoment } from 'components/localized-moment';
import { managePurchase } from '../paths';

/**
 * Style dependencies
 */
import './style.scss';

interface Purchase {
	id: number;
	currencyCode: string;
	expiryDate: string;
	taxText: string;
	productSlug: string;
}

interface Site {
	domain: string;
	slug: string;
}

interface Props {
	site: Site;
	purchases: Purchase[];
	isVisible: boolean;
	onClose: () => void;
	onConfirm: ( purchases: Purchase[] ) => void;
}

const UpcomingRenewalsDialog: FunctionComponent< Props > = ( {
	site,
	purchases,
	isVisible,
	onClose,
	onConfirm,
} ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const [ selectedPurchases, setSelectedPurchases ] = useState< number[] >( [] );

	useEffect( () => {
		if ( isVisible ) {
			setSelectedPurchases( purchases.map( ( purchase ) => purchase.id ) );
		}
	}, [ isVisible, purchases ] );

	const confirmSelectedPurchases = useCallback( () => {
		onConfirm( purchases.filter( ( purchase ) => selectedPurchases.includes( purchase.id ) ) );
	}, [ purchases, selectedPurchases, onConfirm ] );

	return (
		<Dialog
			isVisible={ isVisible }
			leaveTimeout={ 0 }
			additionalClassNames="upcoming-renewals-dialog"
			onClose={ onClose }
		>
			<h2 className="upcoming-renewals-dialog__header">{ translate( 'Upcoming renewals' ) }</h2>
			<h3 className="upcoming-renewals-dialog__subheader">
				{ translate( 'Site: %(siteName)s', { args: { siteName: site.domain } } ) }
			</h3>
			<hr />
			{ purchases.map( ( purchase ) => {
				const expiresText = isExpired( purchase )
					? translate( 'Expired %(expiry)s', {
							args: { expiry: moment( purchase.expiryDate ).fromNow() },
					  } )
					: translate( 'Expires %(expiry)s', {
							args: { expiry: moment( purchase.expiryDate ).fromNow() },
					  } );
				const onChange = () => {
					if ( selectedPurchases.includes( purchase.id ) ) {
						setSelectedPurchases( selectedPurchases.filter( ( id ) => id !== purchase.id ) );
					} else {
						setSelectedPurchases( selectedPurchases.concat( [ purchase.id ] ) );
					}
				};
				return (
					<>
						<div className="upcoming-renewals-dialog__row" key={ purchase.id }>
							<FormLabel
								optional={ false }
								required={ false }
								className="upcoming-renewals-dialog__label"
							>
								<div className="upcoming-renewals-dialog__checkbox">
									<FormInputCheckbox
										className="upcoming-renewals-dialog__checkbox-input"
										name={ `${ purchase.productSlug }-${ purchase.id }` }
										checked={ selectedPurchases.includes( purchase.id ) }
										onChange={ onChange }
									/>
								</div>
								<div className="upcoming-renewals-dialog__name">
									{ getName( purchase ) }
									<div className="upcoming-renewals-dialog__detail">
										{ purchaseType( purchase ) }: { expiresText }
									</div>
								</div>
							</FormLabel>
							<div className="upcoming-renewals-dialog__side">
								<div className="upcoming-renewals-dialog__price">
									{ formatCurrency( getRenewalPrice( purchase ), purchase.currencyCode, {
										stripZeros: true,
									} ) }
								</div>
								<div className="upcoming-renewals-dialog__renewal-settings-link">
									<a onClick={ onClose } href={ managePurchase( site.slug, purchase.id ) }>
										{ translate( 'Manage purchase' ) }
									</a>
								</div>
							</div>
						</div>
						<hr />
					</>
				);
			} ) }
			<div className="upcoming-renewals-dialog__actions">
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
				<Button
					disabled={ selectedPurchases.length === 0 }
					onClick={ confirmSelectedPurchases }
					primary
				>
					{ translate( 'Renew now' ) }
				</Button>
			</div>
		</Dialog>
	);
};

export default UpcomingRenewalsDialog;
