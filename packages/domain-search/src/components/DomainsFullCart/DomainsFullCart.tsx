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
import { close } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
// import { useViewportMatch } from '@wordpress/compose';
import { useDomainSearch } from '../DomainSearch/DomainSearch';
import { DomainsMiniCartSummary } from '../DomainsMiniCart/Summary';
import { DomainsFullCartItems } from './Items';

import './style.scss';

const DomainsFullCart = ( { children }: { children?: React.ReactNode } ) => {
	const { isFullCartOpen, closeFullCart, onContinue } = useDomainSearch();
	const { __ } = useI18n();
	// const isMobile = ! useViewportMatch( 'small' );

	return (
		<motion.div
			initial={ { x: '100%' } }
			animate={ { x: isFullCartOpen ? 0 : '100%' } }
			transition={ { type: 'tween', duration: 0.25 } }
			className="domains-full-cart"
		>
			<Card isRounded={ false } isElevated style={ { height: '100%' } }>
				<CardHeader isBorderless>
					<Heading level={ 2 }>{ __( 'Cart' ) }</Heading>
					<Button variant="tertiary" icon={ close } onClick={ closeFullCart } />
				</CardHeader>
				<CardBody>{ children ?? <DomainsFullCartItems /> }</CardBody>
				<CardFooter>
					<VStack spacing={ 4 }>
						<DomainsMiniCartSummary orientation="horizontal" />
						<Button __next40pxDefaultSize variant="primary" onClick={ onContinue }>
							{ __( 'Continue' ) }
						</Button>
					</VStack>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

DomainsFullCart.Items = DomainsFullCartItems;

export { DomainsFullCart };
