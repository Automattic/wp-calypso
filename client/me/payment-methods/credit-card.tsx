/**
 * External dependencies
 */
import React, { FunctionComponent, ComponentProps } from 'react';

/**
 * Internal dependencies
 */
import StoredCard from './stored-card';
import { Card } from '@automattic/components';

interface Props {
	card: ComponentProps< typeof StoredCard >;
}

const CreditCard: FunctionComponent< Props > = ( { card, children } ) => {
	return (
		<Card className="credit-card__wrapper">
			<div className="credit-card">{ card ? <StoredCard { ...card } /> : children }</div>
		</Card>
	);
};

export default CreditCard;
