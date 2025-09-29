import { formatCurrency } from '@automattic/number-formatters';
import { Link } from '@tanstack/react-router';
import {
	CheckboxControl,
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalDivider as Divider,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { getRelativeTimeString } from '../../../utils/datetime';
import { getSubtitleForDisplay, isExpired, isRenewing } from '../../../utils/purchase';
import { getPurchaseUrlForId } from '../urls';
import type { Purchase } from '@automattic/api-core';

interface Props {
	siteDomain: string;
	purchases: Purchase[];
	onClose: () => void;
	onConfirm: ( purchases: Purchase[] ) => void;
	submitButtonText?: string;
	hideManagePurchaseLinks?: boolean;
}

function ExpiresText( { purchase }: { purchase: Purchase } ) {
	if ( isRenewing( purchase ) ) {
		// translators: "renewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month"
		return sprintf( __( 'renews %(renewDate)s' ), {
			renewDate: getRelativeTimeString( new Date( purchase.renew_date ) ),
		} );
	}
	if ( isExpired( purchase ) ) {
		// translators: "expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"
		return sprintf( __( 'expired %(expiry)s' ), {
			expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );
	}
	// translators: "expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"
	return sprintf( __( 'expires %(expiry)s' ), {
		expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
	} );
}

export function UpcomingRenewalsDialog( {
	siteDomain,
	purchases,
	onClose,
	onConfirm,
	submitButtonText,
	hideManagePurchaseLinks,
}: Props ) {
	const [ selectedPurchases, setSelectedPurchases ] = useState< number[] >( [] );

	const purchasesSortByRecentExpiryDate = useMemo(
		() =>
			[ ...purchases ].sort( ( a, b ) => {
				const compareDateA = isRenewing( a ) ? a.renew_date : a.expiry_date;
				const compareDateB = isRenewing( b ) ? b.renew_date : b.expiry_date;
				return compareDateA?.localeCompare?.( compareDateB );
			} ),
		[ purchases ]
	);

	useEffect( () => {
		setSelectedPurchases( purchases.map( ( purchase ) => purchase.ID ) );
	}, [ purchases ] );

	return (
		<ConfirmDialog
			size="large"
			confirmButtonText={ submitButtonText ?? __( 'Renew now' ) }
			onConfirm={ () =>
				onConfirm( purchases.filter( ( purchase ) => selectedPurchases.includes( purchase.ID ) ) )
			}
			onCancel={ onClose }
		>
			<VStack>
				<Heading>{ __( 'Upcoming renewals' ) }</Heading>
				<Text variant="muted">
					{
						// translators: siteName is the URL of the site
						sprintf( __( 'Site: %(siteName)s' ), { siteName: siteDomain } )
					}
				</Text>
			</VStack>
			<Divider margin={ 3 } />
			{ purchasesSortByRecentExpiryDate.map( ( purchase ) => {
				const purchaseTypeText = getSubtitleForDisplay( purchase );
				const onChange = () => {
					if ( selectedPurchases.includes( purchase.ID ) ) {
						setSelectedPurchases( selectedPurchases.filter( ( id ) => id !== purchase.ID ) );
					} else {
						setSelectedPurchases( selectedPurchases.concat( [ purchase.ID ] ) );
					}
				};
				return (
					<VStack key={ purchase.ID }>
						<HStack alignment="top">
							<HStack alignment="left">
								<CheckboxControl
									name={ `${ purchase.product_slug }-${ purchase.ID }` }
									checked={ selectedPurchases.includes( purchase.ID ) }
									onChange={ onChange }
								/>
								<VStack>
									<Text>{ purchase.is_domain ? purchase.meta ?? '' : purchase.product_name }</Text>
									<Text variant="muted">
										{ purchaseTypeText ? `${ purchaseTypeText }: ` : '' }
										<span>{ purchaseTypeText && <ExpiresText purchase={ purchase } /> }</span>
									</Text>
								</VStack>
							</HStack>
							<HStack>
								<Text>
									{ formatCurrency(
										purchase.sale_amount ?? purchase.amount,
										purchase.currency_code,
										{
											stripZeros: true,
										}
									) }
								</Text>
								{ ! hideManagePurchaseLinks && (
									<Text>
										<Link to={ getPurchaseUrlForId( purchase.ID ) } onClick={ () => onClose() }>
											{ __( 'Manage purchase' ) }
										</Link>
									</Text>
								) }
							</HStack>
						</HStack>
						<Divider margin={ 3 } />
					</VStack>
				);
			} ) }
		</ConfirmDialog>
	);
}
