import {
	__experimentalHStack as HStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
	Card,
} from '@wordpress/components';
import clsx from 'clsx';
import { useDomainSearch } from '../domain-search';
import { DomainsMiniCartActions } from './actions';
import { DomainsMiniCartSummary } from './summary';

import './style.scss';

const AnimatedCard = motion( Card );

const animation = {
	initial: {
		y: '100%',
		display: 'none',
		opacity: 0,
	},
	animateIn: {
		y: 0,
		display: 'block',
		opacity: 1,
	},
	animateOut: {
		y: '100%',
		display: 'none',
		opacity: 0,
	},
};

const DomainsMiniCart = ( { className }: { className?: string } ) => {
	const { cart, isFullCartOpen } = useDomainSearch();

	const shouldDisplayMiniCart = cart.items.length > 0 && ! isFullCartOpen;

	return (
		<AnimatedCard
			initial={ animation.initial }
			animate={ shouldDisplayMiniCart ? animation.animateIn : animation.animateOut }
			transition={ { type: 'tween', duration: 0.25 } }
			className={ clsx( 'domains-mini-cart', className ) }
			isRounded={ false }
			elevation={ 2 }
		>
			<div className="domains-mini-cart__content">
				<HStack spacing={ 2 }>
					<DomainsMiniCartSummary />
					<DomainsMiniCartActions />
				</HStack>
			</div>
		</AnimatedCard>
	);
};

DomainsMiniCart.Summary = DomainsMiniCartSummary;
DomainsMiniCart.Actions = DomainsMiniCartActions;

export { DomainsMiniCart };
