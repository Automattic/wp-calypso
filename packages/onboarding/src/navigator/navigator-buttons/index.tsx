import {
	__experimentalNavigatorButton as NavigatorButton,
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	FlexItem,
} from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight, check } from '@wordpress/icons';
import clsx from 'clsx';
import './style.scss';

interface NavigatorItemProps {
	className?: string;
	icon?: JSX.Element;
	children: React.ReactNode;
	onClick?: () => void;
	checked?: boolean;
	active?: boolean;
}

interface NavigatorButtonAsItemProps extends NavigatorItemProps {
	path: string;
}

export function NavigatorItem( { icon, checked, active, children, ...props }: NavigatorItemProps ) {
	const content = icon ? (
		<HStack justify="flex-start">
			<Icon className="navigator-item__icon" icon={ checked ? check : icon } size={ 24 } />
			<FlexItem className="navigator-item__text" display="flex" isBlock>
				{ children }
			</FlexItem>
		</HStack>
	) : (
		<FlexItem display="flex" isBlock>
			{ children }
		</FlexItem>
	);

	const forwardIcon = isRTL() ? chevronLeft : chevronRight;

	return (
		<Item
			{ ...props }
			className={ clsx( 'navigator-item', {
				'navigator-item--active': active,
			} ) }
		>
			<HStack justify="space-between">
				{ content }
				<Icon icon={ forwardIcon } size={ 24 } />
			</HStack>
		</Item>
	);
}

export const NavigatorButtonAsItem = ( { ...props }: NavigatorButtonAsItemProps ) => {
	return <NavigatorButton as={ NavigatorItem } { ...props } />;
};
