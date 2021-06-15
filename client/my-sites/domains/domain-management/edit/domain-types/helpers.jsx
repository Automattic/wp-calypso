/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { isExpiring, shouldRenderExpiringCreditCard } from 'calypso/lib/purchases';
import { type as domainTypes } from 'calypso/lib/domains/constants';

const TextDiv = styled.div`
	display: block;
`;

const ParentDiv = styled.div`
	display: flex;
	flex-direction: column;
`;

function WrapDomainStatusButtons( props ) {
	const wrapperClassNames = classNames( 'domain-types__wrap-me', props.className );
	return (
		<React.Fragment>
			<div className="domain-types__break" />
			<div className={ wrapperClassNames }>{ props.children }</div>
		</React.Fragment>
	);
}

function DomainExpiryOrRenewal( { domain, isLoadingPurchase, moment, purchase, translate } ) {
	if ( isLoadingPurchase ) {
		return (
			<div className="domain-types__expires-placeholder">
				<p />
			</div>
		);
	}

	let renewalText;
	let expirationText;

	if ( domain.type === domainTypes.MAPPED && ! domain.expiry ) {
		expirationText = translate( 'Expires: Never' );
	} else if ( domain.expired ) {
		expirationText = translate( 'Expired: %(expiry_date)s', {
			args: {
				expiry_date: moment( domain.expiry ).format( 'LL' ),
			},
		} );
	} else if (
		domain.isAutoRenewing &&
		domain.autoRenewalDate &&
		purchase &&
		! isExpiring( purchase ) &&
		! shouldRenderExpiringCreditCard( purchase )
	) {
		if ( domain.type === domainTypes.MAPPED && domain.bundledPlanSubscriptionId ) {
			renewalText = translate( 'Renews with your plan on %(renewal_date)s', {
				args: {
					renewal_date: moment( domain.autoRenewalDate ).format( 'LL' ),
				},
			} );
		} else {
			renewalText = translate( 'Renews: %(renewal_date)s', {
				args: {
					renewal_date: moment( domain.autoRenewalDate ).format( 'LL' ),
				},
			} );

			expirationText = translate( 'Expires: %(expiry_date)s', {
				args: {
					expiry_date: moment.utc( domain.expiry ).format( 'LL' ),
				},
			} );
		}
	} else if ( domain.type === domainTypes.MAPPED && domain.bundledPlanSubscriptionId ) {
		expirationText = translate( 'Expires with your plan on %(expiry_date)s', {
			args: {
				expiry_date: moment( domain.expiry ).format( 'LL' ),
			},
		} );
	} else {
		expirationText = translate( 'Expires: %(expiry_date)s', {
			args: {
				expiry_date: moment( domain.expiry ).format( 'LL' ),
			},
		} );
	}

	return (
		<ParentDiv>
			{ renewalText && <TextDiv>{ renewalText }</TextDiv> }
			{ expirationText && <TextDiv>{ expirationText }</TextDiv> }
		</ParentDiv>
	);
}

export { WrapDomainStatusButtons, DomainExpiryOrRenewal };
