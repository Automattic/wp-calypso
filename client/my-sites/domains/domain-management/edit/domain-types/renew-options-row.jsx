/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getRenewalPrice } from 'calypso/lib/purchases';
import { type as domainTypes } from 'calypso/lib/domains/constants';

const ParentDiv = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 100%;
`;

const Header = styled.div`
	text-transform: uppercase;
`;

const BodyText = styled.p``;

const RenewalPrice = styled.div`
	flex-grow: 1;
`;

const AutoRenewal = styled.div`
	flex-grow: 1;
`;

const Expiration = styled.div`
	flex-grow: 1;
`;

function RenewOptionsRow( {
	domain,
	isLoadingPurchase,
	moment,
	purchase,
	selectedSite,
	translate,
} ) {
	const [ renewalText, setRenewalText ] = useState( null );

	useEffect( () => {
		if ( ! purchase ) return;

		if ( 'manualRenew' !== purchase.expiryStatus ) {
			if ( domain.type === domainTypes.MAPPED && domain.bundledPlanSubscriptionId ) {
				setRenewalText(
					translate( 'Renews with your plan on %(renewal_date)s', {
						args: {
							renewal_date: moment.utc( purchase.renewDate ).format( 'LL' ),
						},
					} )
				);
			} else {
				setRenewalText(
					translate( 'Renews: %(renewal_date)s', {
						args: {
							renewal_date: moment.utc( purchase.renewDate ).format( 'LL' ),
						},
					} )
				);
			}
		} else {
			setRenewalText( 'Disabled' );
		}
	}, [ domain, purchase ] );

	if ( isLoadingPurchase || ! selectedSite.ID ) {
		return (
			<div className="domain-types__expires-placeholder">
				<p />
			</div>
		);
	}

	let expirationText;
	const renewalPrice = getRenewalPrice( purchase );
	const currencyCode = purchase.currencyCode;
	const formattedPrice = formatCurrency( renewalPrice, currencyCode, { stripZeros: true } );

	if ( domain.type === domainTypes.MAPPED && ! domain.expiry ) {
		expirationText = translate( 'Expires: Never' );
	} else if ( domain.expired ) {
		expirationText = translate( 'Expired: %(expiry_date)s', {
			args: {
				expiry_date: moment.utc( domain.expiry ).format( 'LL' ),
			},
		} );
	} else {
		expirationText = translate( 'Expires: %(expiry_date)s', {
			args: {
				expiry_date: moment.utc( domain.expiry ).format( 'LL' ),
			},
		} );
	}

	return (
		<ParentDiv>
			<RenewalPrice>
				<Header>Renewal price</Header>
				<BodyText>{ formattedPrice }/year</BodyText>
			</RenewalPrice>
			<AutoRenewal>
				<Header>Auto renewal</Header>
				<BodyText>{ renewalText }</BodyText>
				{ domain.currentUserCanManage && selectedSite.ID && (
					<AutoRenewToggle
						planName={ selectedSite.plan.product_name_short }
						purchase={ purchase }
						siteDomain={ selectedSite.domain }
						toggleSource="registered-domain-status"
						withTextStatus={ true }
					/>
				) }
			</AutoRenewal>
			<Expiration>
				<Header>Expiration date</Header>
				<BodyText>{ expirationText }</BodyText>
				<RenewButton
					compact={ true }
					purchase={ purchase }
					selectedSite={ selectedSite }
					subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
					tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				/>
			</Expiration>
		</ParentDiv>
	);
}

export { RenewOptionsRow };
