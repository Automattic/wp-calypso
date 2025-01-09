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
				<Button size="small">Button</Button>
				<Button size="small" variant="primary">
					Primary Button
				</Button>
				<Button size="small" variant="secondary">
					Secondary Button
				</Button>
				<Button size="small" variant="tertiary">
					Tertiary Button
				</Button>
				<Button size="small" icon={ more } />
				<Button size="small" variant="primary" icon={ more } />
				<Button size="small" variant="secondary" icon={ more } />
				<Button size="small" variant="tertiary" icon={ more } />
				<Button size="small" variant="primary" icon={ more }>
					Icon & Text
				</Button>
				<Button size="small" variant="primary" isBusy>
					Busy
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
				<Button variant="primary" isBusy>
					Busy
				</Button>
			</Flex>
		</div>
	);
};

export default ButtonExample;
