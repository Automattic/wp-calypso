import { Card } from '@automattic/components';
import {
	Icon,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	type IconType,
} from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

interface OptionCardBenefit {
	icon: IconType;
	iconSize?: number;
	text: ReactNode;
}

interface OptionCardProps {
	benefits?: ReadonlyArray< OptionCardBenefit >;
	disabled?: boolean;
	illustration: ReactElement;
	isPlaceholder?: boolean;
	onSelect?: React.MouseEventHandler;
	titleText: string;
	topText: ReactNode;
}

export function OptionCard( {
	benefits,
	disabled,
	illustration,
	isPlaceholder,
	onSelect,
	titleText,
	topText,
}: OptionCardProps ) {
	const isActionable = !! onSelect && ! isPlaceholder;
	const isDisabled = disabled || ! isActionable;

	return (
		<Card
			tagName="button"
			type="button"
			onClick={ onSelect }
			disabled={ isDisabled }
			className={ clsx( 'option-card', {
				'option-card--is-placeholder': isPlaceholder,
			} ) }
		>
			<VStack as="span" spacing={ 4 } className="option-card__header">
				<HStack as="span" justify="space-between">
					<span className="option-card__illustration">{ illustration }</span>
					{ ! isDisabled && (
						<Icon className="option-card__chevron" icon={ chevronRight } size={ 24 } />
					) }
				</HStack>
				<VStack as="span" spacing={ 2 }>
					<span className="option-card__title">{ titleText }</span>
					<span className="option-card__top-text">{ topText }</span>
				</VStack>
			</VStack>
			{ benefits && (
				<VStack as="span" spacing={ 3 } className="option-card__benefits">
					{ benefits.map( ( benefit, index ) => (
						<HStack as="span" justify="flex-start" spacing={ 3 } key={ 'benefit-' + index }>
							<span className="option-card__benefit-icon">
								<Icon icon={ benefit.icon } size={ benefit.iconSize ?? 20 } />
							</span>
							<span className="option-card__benefit-text">{ benefit.text }</span>
						</HStack>
					) ) }
				</VStack>
			) }
		</Card>
	);
}
