// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

type Props = {
	children: React.ReactNode;
	title: string;
};

export const NavigatorItemGroup = ( { children, title }: Props ) => {
	return (
		<section>
			<VStack spacing="0">
				<h3 className="pattern-layout__label">{ title }</h3>
				{ children }
			</VStack>
		</section>
	);
};
