/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { more } from '@wordpress/icons';
import { Button as InnerButton, Flex, FlexItem } from '@wordpress/components';

const Button = ( props: InnerButton.Props ) => (
	<FlexItem>
		<InnerButton { ...props } />
	</FlexItem>
);

const ButtonExample = () => {
	return (
		<div style={ { padding: '20px' } }>
			<h2>Small Buttons</h2>
			<Flex gap={ 2 }>
				<Button isSmall>Button</Button>
				<Button isPrimary isSmall>
					Primary Button
				</Button>
				<Button isSecondary isSmall>
					Secondary Button
				</Button>
				<Button isTertiary isSmall>
					Tertiary Button
				</Button>
				<Button isSmall icon={ more } />
				<Button isSmall isPrimary icon={ more } />
				<Button isSmall isSecondary icon={ more } />
				<Button isSmall isTertiary icon={ more } />
				<Button isSmall isPrimary icon={ more }>
					Icon & Text
				</Button>
			</Flex>

			<h2>Regular Buttons</h2>
			<Flex gap={ 4 }>
				<Button>Button</Button>
				<Button isPrimary>Primary Button</Button>
				<Button isSecondary>Secondary Button</Button>
				<Button isTertiary>Tertiary Button</Button>
				<Button icon={ more } />
				<Button isPrimary icon={ more } />
				<Button isSecondary icon={ more } />
				<Button isTertiary icon={ more } />
				<Button isPrimary icon={ more }>
					Icon & Text
				</Button>
			</Flex>
		</div>
	);
};

export default ButtonExample;
