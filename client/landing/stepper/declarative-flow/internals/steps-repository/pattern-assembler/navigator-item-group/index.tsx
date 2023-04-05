import {
	__experimentalHStack as HStack,
	__experimentalItemGroup as ItemGroup,
} from '@wordpress/components';
import './style.scss';

type Props = {
	children: React.ReactNode;
	title: string;
};

export const NavigatorItemGroup = ( { children, title }: Props ) => {
	return (
		<section>
			<HStack direction="column" alignment="top" spacing="0">
				<h3 className="pattern-layout__label">{ title }</h3>
				<ItemGroup>{ children }</ItemGroup>
			</HStack>
		</section>
	);
};
