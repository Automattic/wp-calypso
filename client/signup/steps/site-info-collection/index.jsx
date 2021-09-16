import { WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import React from 'react';
import SiteInformationCollection from 'calypso/my-sites/marketing/do-it-for-me/site-info-collection';
import './style.scss';

export default function SiteInfoCollectionStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
} ) {
	const nextStep = () => {
		const cartItem = { product_slug: WPCOM_DIFM_LITE };
		const step = {
			stepName,
			cartItem,
		};

		submitSignupStep( step, {
			...additionalStepData,
		} );
		goToNextStep();
	};

	return (
		<SiteInformationCollection
			onSubmit={ nextStep }
			typeFormStyles={ {
				width: 'calc(100% - 2px)',
				height: '50vh',
				minHeight: '745px',
				padding: '0',
				marginTop: '50px',
				border: '1px solid rgba( 220, 220, 222, 0.64 )',
				borderRadius: '4px',
			} }
		/>
	);
}
