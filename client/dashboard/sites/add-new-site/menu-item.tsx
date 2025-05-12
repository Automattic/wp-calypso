import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import React from 'react';

type Props = {
	children?: JSX.Element;
	description: string;
	title: string;
	icon: JSX.Element;
};

function MenuItem( {
	children,
	description,
	title,
	icon,
	...buttonProps
}: Props & React.ComponentProps< typeof Button > ) {
	return (
		<Button { ...buttonProps } label={ title } style={ { height: 'auto', textAlign: 'left' } }>
			<HStack alignment="start">
				<div style={ { flexShrink: 0 } }>
					<Icon className="dashboard-add-new-site__menu-item-icon" icon={ icon } />
				</div>
				<VStack>
					<Text>{ title }</Text>
					<Text variant="muted">{ description }</Text>
					{ children }
				</VStack>
			</HStack>
		</Button>
	);
}

export default MenuItem;
