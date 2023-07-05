import {
	__experimentalNavigatorButton as NavigatorButton,
	__experimentalHStack as HStack,
	__experimentalItem as Item,
	FlexItem,
} from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight, check } from '@wordpress/icons';
import classnames from 'classnames';
import './style.scss';

interface Props {
	path: string;
	className?: string;
	icon?: JSX.Element;
	children: React.ReactNode;
	onClick?: () => void;
	checked?: boolean;
	active?: boolean;
}

const GenericButton = ( { icon, children, className, checked, ...props }: Props ) => {
	const forwardIcon = isRTL() ? chevronLeft : chevronRight;

	if ( icon ) {
		return (
			<Item
				{ ...props }
				className={ classnames( className, {
					'navigator-button__checklist-item--checked': checked,
				} ) }
			>
				<HStack justify="space-between">
					<HStack justify="flex-start">
						<Icon className="navigator-button__icon" icon={ checked ? check : icon } size={ 24 } />
						<FlexItem className="navigator-button__text">{ children }</FlexItem>
					</HStack>
					<Icon icon={ forwardIcon } size={ 24 } />
				</HStack>
			</Item>
		);
	}

	return (
		<Item { ...{ className, ...props } }>
			<HStack justify="space-between">
				<FlexItem>{ children }</FlexItem>
				<Icon icon={ forwardIcon } size={ 24 } />
			</HStack>
		</Item>
	);
};

export const NavigationButtonAsItem = ( { className, active, ...props }: Props ) => {
	return (
		<NavigatorButton
			as={ GenericButton }
			className={ classnames( 'navigator-button', className, {
				'navigator-button--is-active': active,
			} ) }
			{ ...props }
		/>
	);
};
