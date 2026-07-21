import { useHasEnTranslation } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import {
	CheckboxControl,
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { useLocale } from '../../../app/locale';
import { CardDivider } from '../../../components/card';
import { formatDate } from '../../../utils/datetime';
import {
	getSubtitleForDisplay,
	isRenewingBeforeExpiration,
	isExpiredOrRemoved,
} from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface Props {
	siteDomain: string;
	purchases: Purchase[];
	onClose: () => void;
	onConfirm: ( purchases: Purchase[] ) => void;
	submitButtonText?: string;
}

function getRenewalDescription(
	item: Purchase,
	locale: string,
	hasEnTranslation: ( phrase: string ) => boolean
): string {
	const subtitleText = getSubtitleForDisplay( item );
	const price = formatCurrency( item.sale_amount ?? item.amount, item.currency_code, {
		stripZeros: true,
	} );

	if ( isRenewingBeforeExpiration( item ) ) {
		const date = formatDate( new Date( item.renew_date ), locale, { dateStyle: 'long' } );
		if ( subtitleText && hasEnTranslation( '%1$s: Renews at %2$s on %3$s' ) ) {
			return sprintf(
				// translators: %1$s: purchase type subtitle (e.g. “Site plan”), %2$s: formatted price, %3$s: formatted date
				__( '%1$s: Renews at %2$s on %3$s' ),
				subtitleText,
				price,
				date
			);
		}
		// translators: %1$s: formatted price, %2$s: formatted date
		const text = sprintf( __( 'Renews at %1$s on %2$s' ), price, date );
		return subtitleText ? `${ subtitleText }: ${ text }` : text;
	}

	const date = formatDate( new Date( item.expiry_date ), locale, { dateStyle: 'long' } );

	if ( isExpiredOrRemoved( item ) ) {
		if ( subtitleText && hasEnTranslation( '%1$s: Expired on %2$s' ) ) {
			return sprintf(
				// translators: %1$s: purchase type subtitle (e.g. “Site plan”), %2$s: formatted date
				__( '%1$s: Expired on %2$s' ),
				subtitleText,
				date
			);
		}
		// translators: %s: formatted date
		const text = sprintf( __( 'Expired on %s' ), date );
		return subtitleText ? `${ subtitleText }: ${ text }` : text;
	}

	if ( subtitleText && hasEnTranslation( '%1$s: Expires on %2$s' ) ) {
		return sprintf(
			// translators: %1$s: purchase type subtitle (e.g. “Site plan”), %2$s: formatted date
			__( '%1$s: Expires on %2$s' ),
			subtitleText,
			date
		);
	}
	// translators: %s: formatted date
	const text = sprintf( __( 'Expires on %s' ), date );
	return subtitleText ? `${ subtitleText }: ${ text }` : text;
}

export function UpcomingRenewalsDialog( {
	siteDomain,
	purchases,
	onClose,
	onConfirm,
	submitButtonText,
}: Props ) {
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();

	const purchasesSortByRecentExpiryDate = useMemo(
		() =>
			[ ...purchases ].sort( ( a, b ) => {
				const compareDateA = isRenewingBeforeExpiration( a ) ? a.renew_date : a.expiry_date;
				const compareDateB = isRenewingBeforeExpiration( b ) ? b.renew_date : b.expiry_date;
				return compareDateA?.localeCompare?.( compareDateB );
			} ),
		[ purchases ]
	);

	const [ selection, setSelection ] = useState< string[] >(
		purchases.map( ( p ) => String( p.ID ) )
	);

	useEffect( () => {
		setSelection( purchases.map( ( p ) => String( p.ID ) ) );
	}, [ purchases ] );

	const handleConfirm = () => {
		const selectedIds = new Set( selection );
		const selectedPurchasesData = purchases.filter( ( p ) => selectedIds.has( String( p.ID ) ) );
		onConfirm( selectedPurchasesData );
	};

	return (
		<ConfirmDialog
			overlayClassName="upcoming-renewals-dialog"
			size="medium"
			confirmButtonText={ submitButtonText ?? __( 'Renew now' ) }
			onConfirm={ handleConfirm }
			onCancel={ onClose }
		>
			<VStack spacing={ 4 }>
				<VStack>
					<Heading>{ __( 'Upcoming renewals' ) }</Heading>
					<Text variant="muted" className="upcoming-renewals-dialog__site-label">
						{
							// translators: %(siteName)s: the URL of the site
							sprintf( __( 'Site: %(siteName)s' ), { siteName: siteDomain } )
						}
					</Text>
				</VStack>
				<VStack spacing={ 4 }>
					{ purchasesSortByRecentExpiryDate.map( ( item ) => {
						const id = String( item.ID );
						return (
							<Fragment key={ id }>
								<CardDivider />
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ item.is_domain ? item.meta ?? '' : item.product_name }
									help={ getRenewalDescription( item, locale, hasEnTranslation ) }
									checked={ selection.includes( id ) }
									onChange={ () => {
										setSelection( ( prev ) =>
											prev.includes( id ) ? prev.filter( ( s ) => s !== id ) : [ ...prev, id ]
										);
									} }
								/>
							</Fragment>
						);
					} ) }
				</VStack>
			</VStack>
		</ConfirmDialog>
	);
}
