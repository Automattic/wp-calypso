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
	children: JSX.Element;
	onClick?: () => void;
	checklist?: boolean;
	checked?: boolean;
}

const GenericButton = ( { icon, children, ...props }: Props ) => {
	const forwardIcon = isRTL() ? chevronLeft : chevronRight;

	if ( icon ) {
		return (
			<Item { ...props }>
				<HStack justify="space-between">
					<HStack justify="flex-start">
						<Icon className="navigator-button__icon" icon={ icon } size={ 24 } />
						<FlexItem>{ children }</FlexItem>
					</HStack>
					<Icon icon={ forwardIcon } size={ 24 } />
				</HStack>
			</Item>
		);
	}

	return (
		<Item { ...props }>
			<HStack justify="space-between">
				<FlexItem>{ children }</FlexItem>
				<Icon icon={ forwardIcon } size={ 24 } />
			</HStack>
		</Item>
	);
};

const ChecklistButton = ( { icon, children, className, checked, ...props }: Props ) => {
	return (
		<GenericButton
			{ ...props }
			icon={ checked ? check : icon }
			className={ classnames( className, {
				'navigator-button__checklist-item--checked': checked,
			} ) }
		>
			{ children }
		</GenericButton>
	);
};

export const NavigationButtonAsItem = ( { className, checklist, ...props }: Props ) => {
	return (
		<NavigatorButton
			as={ checklist ? ChecklistButton : GenericButton }
			className={ classnames( 'navigator-button', className ) }
			{ ...props }
		/>
	);
};
