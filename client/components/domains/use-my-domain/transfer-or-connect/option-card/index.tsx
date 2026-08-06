import { Icon, type IconType } from '@wordpress/components';
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

	return (
		<button
			type="button"
			className={ clsx( 'option-card', {
				'option-card--is-placeholder': isPlaceholder,
			} ) }
			onClick={ onSelect }
			disabled={ disabled || ! isActionable }
		>
			<span className="option-card__header">
				<span className="option-card__header-top">
					<span className="option-card__illustration">{ illustration }</span>
					<Icon className="option-card__chevron" icon={ chevronRight } size={ 24 } />
				</span>
				<span className="option-card__title">{ titleText }</span>
				<span className="option-card__top-text">{ topText }</span>
			</span>
			{ benefits && (
				<span className="option-card__benefits">
					{ benefits.map( ( benefit, index ) => (
						<span className="option-card__benefit" key={ 'benefit-' + index }>
							<span className="option-card__benefit-icon">
								<Icon icon={ benefit.icon } size={ benefit.iconSize ?? 20 } />
							</span>
							<span className="option-card__benefit-text">{ benefit.text }</span>
						</span>
					) ) }
				</span>
			) }
		</button>
	);
}
