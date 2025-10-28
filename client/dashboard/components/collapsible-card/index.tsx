import { Card, CardBody, __experimentalHStack as HStack, Icon } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chevronUp, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import './style.scss';

interface CollapsibleCardProps {
	header: React.ReactNode;
	children: React.ReactNode;
	toggleLabel?: string;
}

export const CollapsibleCard = ( { header, children, toggleLabel }: CollapsibleCardProps ) => {
	const [ isCollapsed, setIsCollapsed ] = useState< boolean >( true );
	const id = useInstanceId( CollapsibleCard, 'collapsible-card' );

	const label = toggleLabel ?? __( 'Toggle content' );

	const handleCollapsedChange = () => {
		setIsCollapsed( ! isCollapsed );
	};
	return (
		<Card className={ clsx( 'collapsible-card', { collapsed: isCollapsed } ) }>
			<CardBody>
				<HStack
					justify="space-between"
					className="collapsible-card__header"
					onClick={ handleCollapsedChange }
					tabIndex={ 0 }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Enter' || e.key === ' ' ) {
							e.preventDefault();
							handleCollapsedChange();
						}
					} }
					role="button"
					aria-expanded={ ! isCollapsed }
					aria-controls={ id }
					aria-label={ label }
				>
					{ header }

					<span className="collapsible-card__toggle">
						<Icon icon={ isCollapsed ? chevronDown : chevronUp } />
					</span>
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
