import { LoadingContent } from '@automattic/composite-checkout';
import { useEffect, useState } from 'react';

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

	if ( ! shouldShowLoadingInfo ) {
		return null;
	}

	return (
		<>
			<div>
				<h2>Still submitting, please wait…</h2>
			</div>
			<LoadingContent />
		</>
	);
}
