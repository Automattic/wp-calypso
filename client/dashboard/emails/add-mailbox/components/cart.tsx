import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__unstableMotion as motion,
	Card,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Text } from '../../../components/text';

import './cart.scss';

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
};

export const Cart = ( {
	totalItems,
	totalPrice,
	isCartBusy,
}: {
	totalItems: number;
	totalPrice: string;
	isCartBusy: boolean;
} ) => {
	const mailboxCount = sprintf(
		// translators: %(mailboxes)s is the number of mailboxes selected.
		_n( '%(mailboxes)s mailbox', '%(mailboxes)s mailboxes', totalItems ),
		{
			mailboxes: totalItems,
		}
	);

	return (
		<>
			<div className="cart__cushion" />
			<motion.div
				className="cart__container"
				initial={ animation.initial }
				animate={ animation.animateIn }
				transition={ { type: 'tween', duration: 0.25 } }
			>
				<Card isRounded={ false } elevation={ 2 } style={ { width: '100%' } }>
					<div className="cart">
						<HStack className="cart__content" spacing={ 2 }>
							<VStack spacing={ 2 } alignment="left">
								<Text size="footnote">{ mailboxCount }</Text>
								<Text className="cart-summary__total">{ totalPrice }</Text>
							</VStack>

							<Button variant="primary" __next40pxDefaultSize disabled={ isCartBusy } type="submit">
								{ __( 'Continue' ) }
							</Button>
						</HStack>
					</div>
				</Card>
			</motion.div>
		</>
	);
};
