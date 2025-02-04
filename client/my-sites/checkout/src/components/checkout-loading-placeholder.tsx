import { CALYPSO_CONTACT } from '@automattic/urls';
import { styled } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

export function CheckoutLoadingPlaceholder( {
	checkoutLoadingConditions,
}: {
	checkoutLoadingConditions: Array< { name: string; isLoading: boolean } >;
} ) {
	const showLoadingInfoThresholdMs = 5000;
	const [ shouldShowLoadingInfo, setShowLoadingInfo ] = useState( false );
	useEffect( () => {
		const timer = setTimeout( () => {
			setShowLoadingInfo( true );
		}, showLoadingInfoThresholdMs );
		return () => {
			clearTimeout( timer );
		};
	}, [] );

	return (
		<>
			{ shouldShowLoadingInfo && (
				<CheckoutLoadingInfo checkoutLoadingConditions={ checkoutLoadingConditions } />
			) }
		</>
	);
}

const CheckoutLoadingInfoDiv = styled.div`
	text-align: center;
	margin-bottom: 1em;

	h2 {
		font-size: 1.5em;
	}
`;

function CheckoutLoadingInfo( {
	checkoutLoadingConditions,
}: {
	checkoutLoadingConditions: Array< { name: string; isLoading: boolean } >;
} ) {
	const translate = useTranslate();
	const firstActiveLoadingCondition = checkoutLoadingConditions.find(
		( condition ) => condition.isLoading === true
	);
	if ( ! firstActiveLoadingCondition ) {
		return null;
	}

	return (
		<CheckoutLoadingInfoDiv>
			<div>{ firstActiveLoadingCondition.name }</div>{ ' ' }
			<h2>{ translate( 'Hm… This is taking a while…' ) }</h2>
			<div>
				{ translate(
					'If this page does not load, {{contactSupportLink}}please contact support{{/contactSupportLink}}.',
					{
						components: {
							contactSupportLink: <a target="_blank" href={ CALYPSO_CONTACT } rel="noreferrer" />,
						},
					}
				) }
			</div>
		</CheckoutLoadingInfoDiv>
	);
}
