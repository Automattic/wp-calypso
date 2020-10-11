/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { useSubmitTransaction } from './util';
import { BEFORE_SUBMIT } from './constants';
import Content from './content';
import Placeholder from './placeholder';

/**
 * Style dependencies
 */
import './style.scss';

export function PurchaseModal( { cart, cards, isCartUpdating, onComplete, onClose, siteSlug } ) {
	const translate = useTranslate();
	const [ step, setStep ] = useState( BEFORE_SUBMIT );
	const submitTransaction = useSubmitTransaction( {
		cart,
		setStep,
		storedCard: cards?.[ 0 ],
		onComplete,
		onClose,
		successMessage: translate( 'Your purchase has been completed!' ),
	} );
	const contentProps = {
		cards,
		cart,
		onClose,
		siteSlug,
		step,
		submitTransaction,
	};

	return (
		<Dialog isVisible={ true } baseClassName="purchase-modal dialog" onClose={ onClose }>
			{ isCartUpdating ? <Placeholder /> : <Content { ...contentProps } /> }
		</Dialog>
	);
}
