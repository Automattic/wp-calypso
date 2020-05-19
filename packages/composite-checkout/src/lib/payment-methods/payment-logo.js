/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import {
	VisaLogo,
	AmexLogo,
	MastercardLogo,
	JcbLogo,
	DinersLogo,
	UnionpayLogo,
	DiscoverLogo,
} from '../../components/payment-logos';

export default function PaymentLogo( { brand, isSummary } ) {
	let cardFieldIcon = null;

	switch ( brand ) {
		case 'visa':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<VisaLogo />
				</BrandLogo>
			);
			break;
		case 'mastercard':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<MastercardLogo />
				</SmallBrandLogo>
			);
			break;
		case 'amex':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<AmexLogo />
				</BrandLogo>
			);
			break;
		case 'jcb':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<JcbLogo />
				</SmallBrandLogo>
			);
			break;
		case 'diners':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<DinersLogo />
				</SmallBrandLogo>
			);
			break;
		case 'unionpay':
			cardFieldIcon = (
				<SmallBrandLogo isSummary={ isSummary }>
					<UnionpayLogo />
				</SmallBrandLogo>
			);
			break;
		case 'discover':
			cardFieldIcon = (
				<BrandLogo isSummary={ isSummary }>
					<DiscoverLogo />
				</BrandLogo>
			);
			break;
		default:
			cardFieldIcon = brand === 'unknown' && isSummary ? null : <LockIconGraphic />;
	}

	return cardFieldIcon;
}

const BrandLogo = styled.span`
	display: ${( props ) => ( props.isSummary ? 'inline-block' : 'block') };
	position: ${( props ) => ( props.isSummary ? 'relative' : 'absolute') };
	top: ${( props ) => ( props.isSummary ? '0' : '15px') };
	right: ${( props ) => ( props.isSummary ? '0' : '10px') };
	transform: translateY( ${( props ) => ( props.isSummary ? '4px' : '0') } );
`;

const LockIconGraphic = styled( LockIcon )`
	display: block;
	position: absolute;
	right: 10px;
	top: 14px;
	width: 20px;
	height: 20px;
`;

const SmallBrandLogo = styled( BrandLogo )`
	transform: translate( ${( props ) => ( props.isSummary ? '-10px, 4px' : '10px, 0') } );
`;

function LockIcon( { className } ) {
	return (
		<svg
			className={ className }
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			aria-hidden="true"
			focusable="false"
		>
			<g fill="none">
				<path d="M0 0h24v24H0V0z" />
				<path opacity=".87" d="M0 0h24v24H0V0z" />
			</g>
			<path
				fill="#8E9196"
				d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
			/>
		</svg>
	);
}
