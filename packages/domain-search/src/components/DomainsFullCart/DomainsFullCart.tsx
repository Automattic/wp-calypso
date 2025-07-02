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
import { useCallback, useRef, useEffect } from 'react';
import { useDomainSearch } from '../DomainSearch/DomainSearch';
import { DomainsFullCartItems } from './Items';
import { DomainsFullCartSummary } from './Summary';

import './style.scss';

const DomainsFullCart = ( { children }: { children?: React.ReactNode } ) => {
	const { isFullCartOpen, closeFullCart, onContinue } = useDomainSearch();
	const { __ } = useI18n();
	const isMobile = ! useViewportMatch( 'small' );

	const fullCartRef = useRef< HTMLDivElement >( null );

	const handleClickOutside = useCallback(
		( event: MouseEvent ) => {
			if ( fullCartRef.current && ! fullCartRef.current.contains( event.target as Node ) ) {
				closeFullCart();
			}
		},
		[ closeFullCart ]
	);

	useEffect( () => {
		if ( isFullCartOpen ) {
			document.addEventListener( 'mousedown', handleClickOutside );
			return () => {
				document.removeEventListener( 'mousedown', handleClickOutside );
			};
		}
	}, [ isFullCartOpen, handleClickOutside ] );

	return (
		<motion.div
			ref={ fullCartRef }
			initial={
				isMobile
					? { y: '100%', display: 'none', opacity: 0 }
					: { x: '100%', display: 'none', opacity: 0 }
			}
			animate={
				isMobile
					? {
							y: isFullCartOpen ? 0 : '100%',
							display: isFullCartOpen ? 'block' : 'none',
							opacity: isFullCartOpen ? 1 : 0,
					  }
					: {
							x: isFullCartOpen ? 0 : '100%',
							display: isFullCartOpen ? 'block' : 'none',
							opacity: isFullCartOpen ? 1 : 0,
					  }
			}
			transition={ { type: 'tween', duration: 0.25 } }
			className="domains-full-cart"
		>
			<Card isRounded={ false } elevation={ 2 } style={ { height: '100%' } }>
				<div style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
					<CardHeader isBorderless style={ { flexShrink: 0 } }>
						<Heading level={ 2 }>{ __( 'Cart' ) }</Heading>
						<Button
							label={ __( 'Close' ) }
							icon={ close }
							onClick={ closeFullCart }
							style={ {
								// @ts-expect-error --wp-components-color-accent is not typed.
								'--wp-components-color-accent': 'var( --domain-search-secondary-action-color )',
							} }
						/>
					</CardHeader>
					<CardBody style={ { flex: 1 } } isScrollable>
						{ children ?? <DomainsFullCartItems /> }
					</CardBody>
					<CardFooter style={ { flexShrink: 0 } }>
						<VStack style={ { flex: 1 } } spacing={ 4 }>
							<DomainsFullCartSummary />
							<Button
								style={ { justifyContent: 'center' } }
								__next40pxDefaultSize
								variant="primary"
								onClick={ onContinue }
							>
								{ __( 'Continue' ) }
							</Button>
						</VStack>
					</CardFooter>
				</div>
			</Card>
		</motion.div>
	);
};

DomainsFullCart.Items = DomainsFullCartItems;

export { DomainsFullCart };
