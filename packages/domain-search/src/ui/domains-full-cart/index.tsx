import {
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
	Card,
	CardHeader,
	__experimentalHeading as Heading,
	CardBody,
	Button,
	CardFooter,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef } from 'react';
import { useClickOutside } from '../../hooks/use-click-outside';
import { DomainsFullCartSummary } from '../domains-full-cart-summary';

import './style.scss';

const AnimatedCard = motion( Card );

const createSlideAnimation = ( axis: 'x' | 'y' ) => ( {
	initial: {
		[ axis ]: '100%',
		display: 'none',
		opacity: 0,
	},
	animateIn: {
		[ axis ]: 0,
		display: 'block',
		opacity: 1,
	},
	animateOut: {
		[ axis ]: '100%',
		display: 'none',
		opacity: 0,
	},
} );

export const DomainsFullCart = ( {
	className,
	children,
	isFullCartOpen,
	closeFullCart,
	onContinue,
	isCartBusy,
	totalItems,
	totalPrice,
}: {
	className?: string;
	children?: React.ReactNode;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	onContinue: () => void;
	isCartBusy: boolean;
	totalItems: number;
	totalPrice: string;
} ) => {
	const { __ } = useI18n();
	const isMobile = useViewportMatch( 'small', '<' );

	const fullCartRef = useRef< HTMLDivElement >( null );

	useClickOutside( {
		ref: fullCartRef,
		callback: closeFullCart,
		isEnabled: isFullCartOpen,
	} );

	const animation = isMobile ? createSlideAnimation( 'y' ) : createSlideAnimation( 'x' );

	return (
		<AnimatedCard
			ref={ fullCartRef }
			key={ isMobile ? 'mobile' : 'desktop' }
			initial={ isFullCartOpen ? animation.animateIn : animation.initial }
			animate={ isFullCartOpen ? animation.animateIn : animation.animateOut }
			transition={ { type: 'tween', duration: 0.25 } }
			className={ clsx( 'domains-full-cart', className ) }
			isRounded={ false }
			elevation={ 2 }
		>
			<div className="domains-full-cart__container">
				<CardHeader isBorderless className="domains-full-cart__header">
					<Heading level={ 2 }>{ __( 'Cart' ) }</Heading>
					<Button
						label={ __( 'Close' ) }
						icon={ close }
						onClick={ closeFullCart }
						className="domains-full-cart__close"
					/>
				</CardHeader>
				<CardBody className="domains-full-cart__body" isScrollable>
					{ children }
				</CardBody>
				<CardFooter className="domains-full-cart__footer">
					<VStack className="domains-full-cart__footer-content" spacing={ 4 }>
						<DomainsFullCartSummary totalItems={ totalItems } totalPrice={ totalPrice } />
						<Button
							className="domains-full-cart__continue"
							__next40pxDefaultSize
							variant="primary"
							onClick={ onContinue }
							disabled={ isCartBusy }
						>
							{ __( 'Continue' ) }
						</Button>
					</VStack>
				</CardFooter>
			</div>
		</AnimatedCard>
	);
};
