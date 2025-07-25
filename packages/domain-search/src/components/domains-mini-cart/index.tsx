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

const animation = {
	initial: {
		y: '100%',
		display: 'none',
		opacity: 0,
	},
	animateIn: {
		y: 0,
		display: 'flex',
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
		<motion.div
			className={ clsx( 'domains-mini-cart__container', className ) }
			initial={ animation.initial }
			animate={ shouldDisplayMiniCart ? animation.animateIn : animation.animateOut }
			transition={ { type: 'tween', duration: 0.25 } }
		>
			<Card isRounded={ false } elevation={ 2 } style={ { width: '100%' } }>
				<div className="domains-mini-cart">
					<div className="domains-mini-cart__content">
						<HStack spacing={ 2 }>
							<DomainsMiniCartSummary />
							<DomainsMiniCartActions />
						</HStack>
					</div>
				</div>
			</Card>
		</motion.div>
	);
};

DomainsMiniCart.Summary = DomainsMiniCartSummary;
DomainsMiniCart.Actions = DomainsMiniCartActions;

export { DomainsMiniCart };
