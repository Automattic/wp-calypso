import { Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import type { ReactNode, ReactElement } from 'react';

import './style.scss';

interface OptionCardBenefit {
	icon: ReactElement;
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
					{ isActionable && (
						<Icon className="option-card__chevron" icon={ chevronRight } size={ 24 } />
					) }
				</span>
				<span className="option-card__title">{ titleText }</span>
				<span className="option-card__top-text">{ topText }</span>
			</span>
			{ benefits && (
				<span className="option-card__benefits">
					{ benefits.map( ( benefit, index ) => (
						<span className="option-card__benefit" key={ 'benefit-' + index }>
							<Icon className="option-card__benefit-icon" icon={ benefit.icon } size={ 24 } />
							<span className="option-card__benefit-text">{ benefit.text }</span>
						</span>
					) ) }
				</span>
			) }
		</button>
	);
}
