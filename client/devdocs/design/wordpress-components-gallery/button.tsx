import { Button as InnerButton, Flex, FlexItem } from '@wordpress/components';
import { more } from '@wordpress/icons';

const Button = ( props: React.ComponentProps< typeof InnerButton > ) => (
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
				<Button variant="primary" isSmall>
					Primary Button
				</Button>
				<Button variant="secondary" isSmall>
					Secondary Button
				</Button>
				<Button variant="tertiary" isSmall>
					Tertiary Button
				</Button>
				<Button isSmall icon={ more } />
				<Button isSmall variant="primary" icon={ more } />
				<Button isSmall variant="secondary" icon={ more } />
				<Button isSmall variant="tertiary" icon={ more } />
				<Button isSmall variant="primary" icon={ more }>
					Icon & Text
				</Button>
			</Flex>

			<h2>Regular Buttons</h2>
			<Flex gap={ 4 }>
				<Button>Button</Button>
				<Button variant="primary">Primary Button</Button>
				<Button variant="secondary">Secondary Button</Button>
				<Button variant="tertiary">Tertiary Button</Button>
				<Button icon={ more } />
				<Button variant="primary" icon={ more } />
				<Button variant="secondary" icon={ more } />
				<Button variant="tertiary" icon={ more } />
				<Button variant="primary" icon={ more }>
					Icon & Text
				</Button>
			</Flex>
		</div>
	);
};

export default ButtonExample;
