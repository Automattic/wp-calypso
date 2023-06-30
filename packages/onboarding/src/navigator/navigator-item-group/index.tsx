import {
	__experimentalHStack as HStack,
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
			<HStack direction="column" alignment="top" spacing="0">
				{ title && <h3 className="navigator-item-group__title">{ title }</h3> }
				<ItemGroup>{ children }</ItemGroup>
			</HStack>
		</section>
	);
};

export default NavigatorItemGroup;
