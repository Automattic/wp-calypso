/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, ComponentProps } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StoredCard from './stored-card';

/**
 * Style dependencies
 */
import './style.scss';

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

	const classes = classNames( 'credit-card', className, {
		'is-selected': selected,
		'is-selectable': onSelect,
	} );

	const selectionProps = onSelect && {
		tabIndex: -1,
		role: 'radio',
		'aria-checked': selected,
		onClick: onSelect,
		onKeyPress: handleKeyPress,
	};

	return (
		<div className={ classes } { ...selectionProps }>
			{ card ? <StoredCard { ...card } selected={ selected } /> : children }
		</div>
	);
};

export default CreditCard;
