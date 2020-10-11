/**
 * External dependencies
 */
import React, {
	FunctionComponent,
	Fragment,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';
import { capitalize } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getName,
	getRenewalPrice,
	purchaseType,
	isExpired,
	isRenewing,
} from 'calypso/lib/purchases';
import FormLabel from 'calypso/components/forms/form-label';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { Button, Dialog } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { managePurchase } from '../paths';

/**
 * Type dependencies
 */
import type { Purchase } from 'calypso/lib/purchases/types';

/**
 * Style dependencies
 */
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
	getManagePurchaseUrlFor: ( siteSlug: string, purchaseId: number ) => string;
}

function getExpiresText(
	translate: ReturnType< typeof useTranslate >,
	moment: ReturnType< typeof useLocalizedMoment >,
	purchase: Purchase
): TranslateResult {
	if ( isRenewing( purchase ) ) {
		return translate( 'renews %(renewDate)s', {
			comment:
				'"renewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month"',
			args: { renewDate: moment( purchase.renewDate ).fromNow() },
		} );
	}
	if ( isExpired( purchase ) ) {
		return translate( 'expired %(expiry)s', {
			comment:
				'"expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"',
			args: { expiry: moment( purchase.expiryDate ).fromNow() },
		} );
	}
	return translate( 'expires %(expiry)s', {
		comment:
			'"expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"',
		args: {
			expiry: moment( purchase.expiryDate ).fromNow(),
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
	const moment = useLocalizedMoment();
	const [ selectedPurchases, setSelectedPurchases ] = useState< number[] >( [] );

	const purchasesSortByRecentExpiryDate = useMemo(
		() =>
			[ ...purchases ].sort( ( a, b ) => {
				const compareDateA = isRenewing( a ) ? a.renewDate : a.expiryDate;
				const compareDateB = isRenewing( b ) ? b.renewDate : b.expiryDate;

				return compareDateA?.localeCompare?.( compareDateB );
			} ),
		[ purchases ]
	);

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
			{ purchasesSortByRecentExpiryDate.map( ( purchase ) => {
				const expiresText = getExpiresText( translate, moment, purchase ) as string;
				const purchaseTypeText = purchaseType( purchase );
				const onChange = () => {
					if ( selectedPurchases.includes( purchase.id ) ) {
						setSelectedPurchases( selectedPurchases.filter( ( id ) => id !== purchase.id ) );
					} else {
						setSelectedPurchases( selectedPurchases.concat( [ purchase.id ] ) );
					}
				};
				return (
					<Fragment key={ purchase.id }>
						<div className="upcoming-renewals-dialog__row">
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
										{ purchaseTypeText ? `${ purchaseTypeText }: ` : '' }
										<span className={ isExpired( purchase ) ? 'expired' : '' }>
											{ purchaseTypeText ? expiresText : capitalize( expiresText ) }
										</span>
									</div>
								</div>
							</FormLabel>
							<div className="upcoming-renewals-dialog__side">
								<div className="upcoming-renewals-dialog__price">
									{ formatCurrency( getRenewalPrice( purchase ), purchase.currencyCode, {
										stripZeros: true,
									} ) }
								</div>
								{ showManagePurchaseLinks && (
									<div className="upcoming-renewals-dialog__renewal-settings-link">
										<a
											onClick={ onClose }
											href={ getManagePurchaseUrlFor( site.slug, purchase.id ) }
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
