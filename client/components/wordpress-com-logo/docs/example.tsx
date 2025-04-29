import { Flex, FlexItem } from '@wordpress/components';
import WordPressComLogo from 'calypso/components/wordpress-com-logo';

function WordPressComLogoExample() {
	return (
		<Flex gap={ 8 } direction="column">
			<FlexItem>
				<h3>Color variant (default)</h3>
				<WordPressComLogo size={ 120 } />
			</FlexItem>

			<FlexItem>
				<h3>Black variant</h3>
				<WordPressComLogo size={ 120 } variant="black" />
			</FlexItem>

			<FlexItem>
				<h3>White variant</h3>
				<div style={ { background: '#000', padding: '20px' } }>
					<WordPressComLogo size={ 120 } variant="white" />
				</div>
			</FlexItem>
		</Flex>
	);
}

export default WordPressComLogoExample;
