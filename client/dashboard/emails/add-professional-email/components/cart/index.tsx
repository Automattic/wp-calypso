import {
	__experimentalHStack as HStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
	Card,
} from '@wordpress/components';
import clsx from 'clsx';
import { CartActions } from './actions';
import { CartSummary } from './summary';

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

export const Cart = ( {
	className,
	totalItems,
	totalPrice,
	onContinue,
	isCartBusy,
}: {
	className?: string;
	totalItems: number;
	totalPrice: string;
	onContinue: () => void;
	isCartBusy: boolean;
} ) => {
	return (
		<>
			<div className="cart__cushion" />
			<motion.div
				className={ clsx( 'cart__container', className ) }
				initial={ animation.initial }
				animate={ animation.animateIn }
				transition={ { type: 'tween', duration: 0.25 } }
			>
				<Card isRounded={ false } elevation={ 2 } style={ { width: '100%' } }>
					<div className="cart">
						<div className="cart__content">
							<HStack spacing={ 2 }>
								<CartSummary totalItems={ totalItems } totalPrice={ totalPrice } />
								<CartActions onContinue={ onContinue } isCartBusy={ isCartBusy } />
							</HStack>
						</div>
					</div>
				</Card>
			</motion.div>
		</>
	);
};
