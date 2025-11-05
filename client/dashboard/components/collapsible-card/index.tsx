import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import { Card, CardBody } from '../card';
import './style.scss';

interface CollapsibleCardProps {
	header: React.ReactNode;
	children: React.ReactNode;
	isBorderless?: boolean;
	toggleLabel?: string;
	initialExpanded?: boolean;
	className?: string;
	// Controlled mode props
	expanded?: boolean;
	onToggle?: ( expanded: boolean ) => void;
}

export const CollapsibleCard = ( {
	header,
	children,
	toggleLabel,
	isBorderless = false,
	initialExpanded = false,
	expanded: controlledExpanded,
	className,
	onToggle,
}: CollapsibleCardProps ) => {
	// Internal state for uncontrolled mode
	const [ internalExpanded, setInternalExpanded ] = useState< boolean >( initialExpanded );

	// Determine if controlled
	const isControlled = controlledExpanded !== undefined;
	const isExpanded = isControlled ? controlledExpanded : internalExpanded;

	const id = useInstanceId( CollapsibleCard, 'collapsible-card' );
	const label = toggleLabel ?? __( 'Toggle content' );

	const handleCollapsedChange = () => {
		const newExpandedState = ! isExpanded;

		if ( ! isControlled ) {
			// Uncontrolled: update internal state
			setInternalExpanded( newExpandedState );
		}

		// Always call onToggle if provided (for both modes)
		onToggle?.( newExpandedState );
	};
	return (
		<Card
			className={ clsx( 'collapsible-card', { collapsed: ! isExpanded }, className ) }
			isBorderless={ isBorderless }
		>
			<CardBody>
				<HStack justify="space-between" className="collapsible-card__header">
					{ header }
					<Button
						icon={ chevronUp }
						className={ clsx( 'collapsible-card__toggle', { collapsed: ! isExpanded } ) }
						onClick={ handleCollapsedChange }
						aria-expanded={ isExpanded }
						aria-controls={ id }
						aria-label={ label }
					/>
				</HStack>
				{ isExpanded && (
					<div className="collapsible-card__content" id={ id }>
						{ children }
					</div>
				) }
			</CardBody>
		</Card>
	);
};
