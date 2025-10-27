import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import './index.scss';

interface CollapsibleCardProps {
	header: React.ReactNode;
	children: React.ReactNode;
}

export const CollapsibleCard = ( { header, children }: CollapsibleCardProps ) => {
	const [ isCollapsed, setIsCollapsed ] = useState< boolean >( true );

	const handleCollapsedChange = () => {
		setIsCollapsed( ! isCollapsed );
	};
	return (
		<Card className={ clsx( 'collapsible-card', { collapsed: isCollapsed } ) }>
			<CardBody>
				<HStack>
					{ header }
					<Button
						icon={ chevronUp }
						className={ clsx( 'collapsible-card__toggle', { collapsed: isCollapsed } ) }
						variant="tertiary"
						onClick={ handleCollapsedChange }
					/>
				</HStack>
				{ ! isCollapsed && <div className="collapsible-card__content">{ children }</div> }
			</CardBody>
		</Card>
	);
};
