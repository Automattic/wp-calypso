import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';

const SubmittingWrapper = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	background: white;
	height: 100%;
	width: 100%;
	z-index: 100000;
	margin: 0;
	padding: 1em;
	padding-top: 32vh;
	text-align: center;
`;

const SubmittingTitle = styled.div`
	font-family: 'Recoleta', 'Noto Serif', Georgia, 'Times New Roman', Times, serif;
	font-size: 1.625rem;
	line-height: 40px;
	text-align: center;
	vertical-align: middle;
	margin: 0;
`;

export function CheckoutSubmittingFullPage() {
	const showLoadingInfoThresholdMs = 2000;
	const [ shouldShowLoadingInfo, setShowLoadingInfo ] = useState( false );
	useEffect( () => {
		const timer = setTimeout( () => {
			setShowLoadingInfo( true );
		}, showLoadingInfoThresholdMs );
		return () => {
			clearTimeout( timer );
		};
	}, [] );
	const translate = useTranslate();

	if ( ! shouldShowLoadingInfo ) {
		return null;
	}

	return (
		<SubmittingWrapper>
			<SubmittingTitle>
				{ translate( "Almost there – we're currently finalizing your order." ) }
			</SubmittingTitle>
			<LoadingEllipsis />
		</SubmittingWrapper>
	);
}
