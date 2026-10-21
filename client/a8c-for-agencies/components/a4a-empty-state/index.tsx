import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { preventWidows } from 'calypso/lib/formatting';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	icon: React.ComponentProps< typeof Icon >[ 'icon' ];
	title: string;
	description?: string;
	children?: ReactNode;
}

export default function A4AEmptyState( { icon, title, description, children }: Props ) {
	return (
		<VStack className="a4a-empty-state" spacing={ 5 } alignment="center">
			<div className="a4a-empty-state-icon">
				<Icon icon={ icon } size={ 40 } />
			</div>
			<VStack spacing={ 2 } alignment="center">
				<Text size={ 20 } weight={ 600 }>
					{ title }
				</Text>
				{ description && <Text variant="muted">{ preventWidows( description ) }</Text> }
			</VStack>
			{ children }
		</VStack>
	);
}
