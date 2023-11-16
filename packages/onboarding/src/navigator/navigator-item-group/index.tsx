import {
	__experimentalVStack as VStack,
	__experimentalItemGroup as ItemGroup,
} from '@wordpress/components';
import './style.scss';

type Props = {
	children: React.ReactNode;
	title?: string;
};

const NavigatorItemGroup = ( { children, title }: Props ) => {
	return (
		<section className="navigator-item-group">
			<VStack direction="column" justify="flex-start" alignment="stretch">
				{ title && <h3 className="navigator-item-group__title">{ title }</h3> }
				<ItemGroup>{ children }</ItemGroup>
			</VStack>
		</section>
	);
};

export default NavigatorItemGroup;
