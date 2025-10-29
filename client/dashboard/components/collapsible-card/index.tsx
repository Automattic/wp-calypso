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
	initialExpanded?: boolean;
	isBorderless?: boolean;
	toggleLabel?: string;
}

export const CollapsibleCard = ( {
	header,
	children,
	toggleLabel,
	isBorderless = false,
	initialExpanded = false,
}: CollapsibleCardProps ) => {
	const [ isCollapsed, setIsCollapsed ] = useState< boolean >( ! initialExpanded );
	const id = useInstanceId( CollapsibleCard, 'collapsible-card' );
	const label = toggleLabel ?? __( 'Toggle content' );

	const handleCollapsedChange = () => {
		setIsCollapsed( ! isCollapsed );
	};
	return (
		<Card
			className={ clsx( 'collapsible-card', { collapsed: isCollapsed } ) }
			isBorderless={ isBorderless }
		>
			<CardBody>
				<HStack justify="space-between" className="collapsible-card__header">
					{ header }
					<Button
						icon={ chevronUp }
						className={ clsx( 'collapsible-card__toggle', { collapsed: isCollapsed } ) }
						onClick={ handleCollapsedChange }
						aria-expanded={ ! isCollapsed }
						aria-controls={ id }
						aria-label={ label }
					/>
				</HStack>
				{ ! isCollapsed && (
					<div className="collapsible-card__content" id={ id }>
						{ children }
					</div>
				) }
			</CardBody>
		</Card>
	);
};
