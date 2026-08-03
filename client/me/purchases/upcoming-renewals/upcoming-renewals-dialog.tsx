import { Button, Dialog, FormLabel } from '@automattic/components';
import { capitalize } from '@automattic/js-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent, Fragment, useState, useEffect, useCallback, useMemo } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { getRelativeDayString } from 'calypso/dashboard/utils/datetime';
import {
	getName,
	purchaseType,
	isRenewingBeforeExpiration,
	isExpiredOrRemoved,
} from '../lib/raw-purchase-helpers';
import { managePurchase } from '../paths';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

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
	submitButtonText?: string | TranslateResult;
	showManagePurchaseLinks?: boolean;
	getManagePurchaseUrlFor?: ( siteSlug: string, purchaseId: number ) => string;
}

function getExpiresText(
	translate: ReturnType< typeof useTranslate >,
	purchase: Purchase
): TranslateResult {
	if ( isRenewingBeforeExpiration( purchase ) ) {
		return translate( 'renews %(renewDate)s', {
			comment:
				'"renewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month", "today"',
			args: { renewDate: getRelativeDayString( new Date( purchase.renew_date ), 'upcoming' ) },
		} );
	}
	if ( isExpiredOrRemoved( purchase ) ) {
		return translate( 'expired %(expiry)s', {
			comment:
				'"expiry" is relative to the present time and it is already localized, eg. "a week ago", "today"',
			args: { expiry: getRelativeDayString( new Date( purchase.expiry_date ), 'past' ) },
		} );
	}
	return translate( 'expires %(expiry)s', {
		comment:
			'"expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "today"',
		args: {
			expiry: getRelativeDayString( new Date( purchase.expiry_date ), 'upcoming' ),
		},
	} );
}

const UpcomingRenewalsDialog: FunctionComponent< Props > = ( {
	site,
	purchases,
	isVisible,
	onClose,
	onConfirm,
	submitButtonText = '',
	showManagePurchaseLinks = true,
	getManagePurchaseUrlFor = managePurchase,
} ) => {
	const translate = useTranslate();
	const [ selectedPurchases, setSelectedPurchases ] = useState< number[] >( [] );

	const purchasesSortByRecentExpiryDate = useMemo(
		() =>
			[ ...purchases ].sort( ( a, b ) => {
				const compareDateA = isRenewingBeforeExpiration( a ) ? a.renew_date : a.expiry_date;
				const compareDateB = isRenewingBeforeExpiration( b ) ? b.renew_date : b.expiry_date;

				return compareDateA?.localeCompare?.( compareDateB );
			} ),
		[ purchases ]
	);

	useEffect( () => {
		if ( isVisible ) {
			setSelectedPurchases( purchases.map( ( purchase ) => purchase.ID ) );
		}
	}, [ isVisible, purchases ] );

	const confirmSelectedPurchases = useCallback( () => {
		onConfirm( purchases.filter( ( purchase ) => selectedPurchases.includes( purchase.ID ) ) );
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
			{ purchasesSortByRecentExpiryDate.map( ( purchase ) => {
				const expiresText = getExpiresText( translate, purchase ) as string;
				const purchaseTypeText = purchaseType( purchase );
				const onChange = () => {
					if ( selectedPurchases.includes( purchase.ID ) ) {
						setSelectedPurchases( selectedPurchases.filter( ( id ) => id !== purchase.ID ) );
					} else {
						setSelectedPurchases( selectedPurchases.concat( [ purchase.ID ] ) );
					}
				};
				return (
					<Fragment key={ purchase.ID }>
						<div className="upcoming-renewals-dialog__row">
							<FormLabel
								optional={ false }
								required={ false }
								className="upcoming-renewals-dialog__label"
							>
								<div className="upcoming-renewals-dialog__checkbox">
									<FormInputCheckbox
										className="upcoming-renewals-dialog__checkbox-input"
										name={ `${ purchase.product_slug }-${ purchase.ID }` }
										checked={ selectedPurchases.includes( purchase.ID ) }
										onChange={ onChange }
									/>
								</div>
								<div className="upcoming-renewals-dialog__name">
									{ getName( purchase ) }
									<div className="upcoming-renewals-dialog__detail">
										{ purchaseTypeText ? `${ purchaseTypeText }: ` : '' }
										<span className={ isExpiredOrRemoved( purchase ) ? 'expired' : '' }>
											{ purchaseTypeText ? expiresText : capitalize( expiresText ) }
										</span>
									</div>
								</div>
							</FormLabel>
							<div className="upcoming-renewals-dialog__side">
								<div className="upcoming-renewals-dialog__price">
									{ formatCurrency(
										purchase.sale_amount || purchase.amount,
										purchase.currency_code,
										{ stripZeros: true }
									) }
								</div>
								{ showManagePurchaseLinks && (
									<div className="upcoming-renewals-dialog__renewal-settings-link">
										<a
											onClick={ onClose }
											href={ getManagePurchaseUrlFor( site.slug, purchase.ID ) }
										>
											{ translate( 'Manage purchase' ) }
										</a>
									</div>
								) }
							</div>
						</div>
						<hr />
					</Fragment>
				);
			} ) }
			<div className="upcoming-renewals-dialog__actions">
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
				<Button
					disabled={ selectedPurchases.length === 0 }
					onClick={ confirmSelectedPurchases }
					primary
				>
					{ submitButtonText || translate( 'Renew now' ) }
				</Button>
			</div>
		</Dialog>
	);
};

export default UpcomingRenewalsDialog;
