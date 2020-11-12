/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, ComponentProps } from 'react';

/**
 * Internal dependencies
 */
import StoredCard from './stored-card';
import { Card } from '@automattic/components';

type SelectHandler = React.EventHandler<
	React.MouseEvent< HTMLDivElement > | React.KeyboardEvent< HTMLDivElement >
>;

interface Props {
	card: ComponentProps< typeof StoredCard >;
	selected: boolean;
	onSelect?: SelectHandler;
	className?: string;
}

const CreditCard: FunctionComponent< Props > = ( {
	card,
	selected,
	onSelect,
	className,
	children,
} ) => {
	const handleKeyPress: React.KeyboardEventHandler< HTMLDivElement > = useCallback(
		( event ) => {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				( onSelect as SelectHandler )( event );
			}
		},
		[ onSelect ]
	);

	const selectionProps = onSelect && {
		tabIndex: -1,
		role: 'radio',
		'aria-checked': selected,
		onClick: onSelect,
		onKeyPress: handleKeyPress,
	};

	return (
		<Card className="credit-card" { ...selectionProps }>
			{ card ? <StoredCard { ...card } selected={ selected } /> : children }
		</Card>
	);
};

export default CreditCard;
