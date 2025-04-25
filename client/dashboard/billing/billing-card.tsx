import {
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import RouterLinkButton from '../router-link-button';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface CardProps {
	title: string;
	icon: ReactElement;
	to: string;
	description?: string;
	children?: ReactNode;
}

export default function BillingCard( { title, icon, description, to, children }: CardProps ) {
	return (
		<RouterLinkButton to={ to } className="billing-card-button">
			<Card className="billing-card">
				<HStack spacing={ 4 } justify="space-between" alignment="flex-start">
					<HStack justify="flex-start" spacing={ 2 } alignment="flex-start">
						<Icon icon={ icon } className="billing-card-icon" />
						<VStack>
							<Text size={ 18 }>{ title }</Text>
							{ description && <Text variant="muted">{ description }</Text> }
							{ children }
						</VStack>
					</HStack>
					<Icon icon={ chevronRight } className="billing-card-icon" />
				</HStack>
			</Card>
		</RouterLinkButton>
	);
}
