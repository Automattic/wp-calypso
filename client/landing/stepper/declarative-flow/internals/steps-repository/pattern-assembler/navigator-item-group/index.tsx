import { isEnabled } from '@automattic/calypso-config';
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
	return isEnabled( 'pattern-assembler/color-and-fonts' ) ? (
		<section>
			<HStack direction="column" alignment="top" spacing="0">
				<h3 className="pattern-layout__navigator-item-group">{ title }</h3>
				<ItemGroup>{ children }</ItemGroup>
			</HStack>
		</section>
	) : (
		<ItemGroup>{ children }</ItemGroup>
	);
};
