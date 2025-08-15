import {
	__experimentalHStack as HStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
	Card,
} from '@wordpress/components';
import clsx from 'clsx';
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

export const DomainsMiniCart = ( {
	className,
	isMiniCartOpen,
	totalItems,
	totalPrice,
	openFullCart,
	onContinue,
	isCartBusy,
}: {
	className?: string;
	isMiniCartOpen: boolean;
	totalItems: number;
	totalPrice: string;
	openFullCart: () => void;
	onContinue: () => void;
	isCartBusy: boolean;
} ) => {
	return (
		<>
			<div className="domains-mini-cart__cushion" />
			<motion.div
				className={ clsx( 'domains-mini-cart__container', className ) }
				initial={ animation.initial }
				animate={ isMiniCartOpen ? animation.animateIn : animation.animateOut }
				transition={ { type: 'tween', duration: 0.25 } }
			>
				<Card isRounded={ false } elevation={ 2 } style={ { width: '100%' } }>
					<div className="domains-mini-cart">
						<div className="domains-mini-cart__content">
							<HStack spacing={ 2 }>
								<DomainsMiniCartSummary
									totalItems={ totalItems }
									totalPrice={ totalPrice }
									openFullCart={ openFullCart }
								/>
								<DomainsMiniCartActions
									openFullCart={ openFullCart }
									onContinue={ onContinue }
									isCartBusy={ isCartBusy }
								/>
							</HStack>
						</div>
					</div>
				</Card>
			</motion.div>
		</>
	);
};
