import { Flex, FlexItem } from '@wordpress/components';
import PoweredBy from 'calypso/components/powered-by';

const PoweredByExample = () => {
	return (
		<div>
			<h3>Color variant</h3>
			<Flex gap={ 4 }>
				<FlexItem>
					<PoweredBy brand="jetpack" variant="color" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="woocommerce" variant="color" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="wpcloud" variant="color" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="wpcom" variant="color" />
				</FlexItem>
			</Flex>

			<h3>Black variant</h3>
			<Flex gap={ 4 }>
				<FlexItem>
					<PoweredBy brand="jetpack" variant="black" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="woocommerce" variant="black" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="wpcloud" variant="black" />
				</FlexItem>
				<FlexItem>
					<PoweredBy brand="wpcom" variant="black" />
				</FlexItem>
			</Flex>

			<h3>White variant</h3>
			<div style={ { background: '#000', padding: '20px' } }>
				<Flex gap={ 4 }>
					<FlexItem>
						<PoweredBy brand="jetpack" variant="white" />
					</FlexItem>
					<FlexItem>
						<PoweredBy brand="woocommerce" variant="white" />
					</FlexItem>
					<FlexItem>
						<PoweredBy brand="wpcloud" variant="white" />
					</FlexItem>
					<FlexItem>
						<PoweredBy brand="wpcom" variant="white" />
					</FlexItem>
				</Flex>
			</div>
		</div>
	);
};

export default PoweredByExample;
