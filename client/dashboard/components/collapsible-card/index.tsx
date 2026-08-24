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
	size?: React.ComponentProps< typeof Card >[ 'size' ];
	toggleLabel?: string;
	initialExpanded?: boolean;
	className?: string;
	// When disabled, the card is forced collapsed and can't be toggled.
	disabled?: boolean;
	// Controlled mode props
	expanded?: boolean;
	onToggle?: ( expanded: boolean ) => void;
}

export const CollapsibleCard = ( {
	header,
	children,
	toggleLabel,
	size = 'medium',
	isBorderless = false,
	initialExpanded = false,
	disabled = false,
	expanded: controlledExpanded,
	className,
	onToggle,
}: CollapsibleCardProps ) => {
	// Internal state for uncontrolled mode
	const [ internalExpanded, setInternalExpanded ] = useState< boolean >( initialExpanded );

	// Determine if controlled
	const isControlled = controlledExpanded !== undefined;
	const isExpanded = ! disabled && ( isControlled ? controlledExpanded : internalExpanded );

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

	const handleHeaderClick = ( event: React.MouseEvent< HTMLDivElement > ) => {
		// Check if click originated from an interactive element
		const target = event.target as HTMLElement;
		const headerElement = event.currentTarget;

		// Check if the target or any parent is an interactive element
		const interactiveElement = target.closest(
			'button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"], [role="tab"]'
		);

		// Only toggle if click is not on an interactive element within the header
		// Exclude the header element itself (which has role="button" for accessibility)
		const isClickOnInteractiveElement =
			interactiveElement &&
			interactiveElement !== headerElement &&
			headerElement.contains( interactiveElement );

		if ( ! isClickOnInteractiveElement ) {
			handleCollapsedChange();
		}
	};

	return (
		<Card
			className={ clsx(
				'collapsible-card',
				{ collapsed: ! isExpanded, 'is-disabled': disabled },
				className
			) }
			isBorderless={ isBorderless }
			size={ size }
		>
			<CardBody>
				<div
					className="collapsible-card__header"
					onClick={ disabled ? undefined : handleHeaderClick }
					role={ disabled ? undefined : 'button' }
					tabIndex={ disabled ? undefined : 0 }
					onKeyDown={
						disabled
							? undefined
							: ( event: React.KeyboardEvent< HTMLDivElement > ) => {
									// Allow keyboard activation with Enter or Space
									if ( event.key === 'Enter' || event.key === ' ' ) {
										event.preventDefault();
										handleCollapsedChange();
									}
							  }
					}
					aria-expanded={ disabled ? undefined : isExpanded }
					aria-disabled={ disabled || undefined }
					aria-label={ label }
				>
					<HStack justify="space-between">
						{ header }
						<Button
							icon={ chevronUp }
							className={ clsx( 'collapsible-card__toggle', { collapsed: ! isExpanded } ) }
							disabled={ disabled }
							onClick={ ( event: React.MouseEvent< HTMLButtonElement > ) => {
								event.stopPropagation();
								handleCollapsedChange();
							} }
							aria-expanded={ isExpanded }
							aria-controls={ id }
							aria-label={ label }
						/>
					</HStack>
				</div>
				{ isExpanded && (
					<div className="collapsible-card__content" id={ id }>
						{ children }
					</div>
				) }
			</CardBody>
		</Card>
	);
};
