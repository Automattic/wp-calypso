/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AutoRenewToggle from 'calypso/me/purchases/manage-purchase/auto-renew-toggle';
import MaterialIcon from 'calypso/components/material-icon';
import Gridicon from 'calypso/components/gridicon';
import RenewButton from 'calypso/my-sites/domains/domain-management/edit/card/renew-button';
import { getRenewalPrice } from 'calypso/lib/purchases';
import { type as domainTypes } from 'calypso/lib/domains/constants';

const ParentDiv = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 100%;

	@media ( min-width: 550px ) {
		flex-direction: row;
	}
`;

const Section = styled.div`
	flex: 1;
	margin: 10px;
`;

const Header = styled.div`
	text-transform: uppercase;
	font-size: 12px;
	color: var( --color-neutral-50 );
`;

const BodyText = styled.div`
	display: flex;
	align-items: center;
	margin: 10px 0;

	& > svg {
		padding-right: 5px;
	}

	& > span {
		font-size: 12px;
	}
`;

const AutoRenew = styled( BodyText )`
	color: var( --color-success );

	& > svg {
		fill: var( --color-success );
	}
`;

const ManualRenew = styled( BodyText )`
	font-weight: 600;

	& > svg {
		fill: var( --color-warning-30 );
	}
`;

function RenewOptionsRow( { domain, isLoadingPurchase, moment, purchase, selectedSite } ) {
	const [ renewalText, setRenewalText ] = useState( null );
	const [ autoRenewStatus, setAutoRenewStatus ] = useState( null );
	const translate = useTranslate();

	useEffect( () => {
		if ( ! purchase ) return;

		if ( 'manualRenew' !== purchase.expiryStatus ) {
			setAutoRenewStatus( 'Enabled' );
			setRenewalText(
				translate( 'This domain will automatically renew on %(renewal_date)s.', {
					args: {
						renewal_date: moment.utc( purchase.renewDate ).format( 'LL' ),
					},
				} )
			);
		} else {
			setAutoRenewStatus( 'Disabled' );
			setRenewalText( null );
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
		expirationText = translate( 'Never' );
	} else {
		expirationText = moment.utc( domain.expiry ).format( 'LL' );
	}

	return (
		<ParentDiv>
			<Section>
				<Header>{ translate( 'Renewal price' ) }</Header>
				<BodyText>{ formattedPrice }/year</BodyText>
			</Section>
			<Section>
				<Header>{ translate( 'Auto renewal' ) }</Header>
				{ 'Enabled' === autoRenewStatus ? (
					<AutoRenew>
						<MaterialIcon icon="check_circle" />
						{ autoRenewStatus }
					</AutoRenew>
				) : (
					<ManualRenew>
						<Gridicon icon="notice" />
						{ autoRenewStatus }
					</ManualRenew>
				) }
				{ renewalText && (
					<BodyText>
						<span>{ renewalText }</span>
					</BodyText>
				) }
				{ domain.currentUserCanManage && (
					<AutoRenewToggle
						displayButton={ true }
						planName={ selectedSite.plan.product_name_short }
						purchase={ purchase }
						siteDomain={ selectedSite.domain }
						toggleSource="registered-domain-status"
						withTextStatus={ true }
					/>
				) }
			</Section>
			<Section>
				<Header>{ translate( 'Expiration date' ) }</Header>
				<BodyText>{ expirationText }</BodyText>
				<RenewButton
					compact={ true }
					purchase={ purchase }
					selectedSite={ selectedSite }
					subscriptionId={ parseInt( domain.subscriptionId, 10 ) }
					tracksProps={ { source: 'registered-domain-status', domain_status: 'active' } }
				/>
			</Section>
		</ParentDiv>
	);
}

export { RenewOptionsRow };
