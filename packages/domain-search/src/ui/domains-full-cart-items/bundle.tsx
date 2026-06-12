import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Notice,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import type { DomainInCart } from './types';

/**
 * Render a domain bundle as a single grouped cart row: a "Domain bundle"
 * label, the member domains listed beneath it, one summed price, and a single
 * remove action that clears every member from the cart at once (matching the
 * backend's all-or-nothing rule).
 */
export const DomainsFullCartBundleItem = ( {
	members,
	price,
	disabled,
	isBusy,
	onRemove,
	errorMessage,
	removeErrorMessage,
}: {
	members: DomainInCart[];
	price: string;
	disabled: boolean;
	isBusy: boolean;
	onRemove: () => void;
	errorMessage?: string;
	removeErrorMessage: () => void;
} ) => {
	const { __ } = useI18n();

	const bundleLabel = __( 'Domain bundle' );

	return (
		<Card title={ bundleLabel }>
			<CardBody size="small">
				<VStack spacing={ 4 }>
					<HStack alignment="top" justify="space-between" spacing={ 6 }>
						<VStack spacing={ 2 } alignment="left">
							<Text size="medium" weight={ 500 }>
								{ bundleLabel }
							</Text>
							{ members.map( ( member ) => {
								const domainName = `${ member.domain }.${ member.tld }`;

								return (
									<Text
										key={ member.uuid }
										size="medium"
										aria-label={ domainName }
										style={ { wordBreak: 'break-all' } }
									>
										{ member.domain }
										<Text size="inherit" weight={ 500 } style={ { whiteSpace: 'nowrap' } }>
											.{ member.tld }
										</Text>
									</Text>
								);
							} ) }
							<Button
								disabled={ disabled }
								isBusy={ isBusy }
								variant="link"
								className="domains-full-cart-items__remove"
								onClick={ onRemove }
							>
								{ __( 'Remove bundle' ) }
							</Button>
						</VStack>
						<VStack className="domains-full-cart-items__price">
							<HStack alignment="right" spacing={ 2 }>
								<Text
									size="small"
									aria-label={ sprintf(
										// translators: %(price)s is the total price of the domain bundle.
										__( 'Price: %(price)s' ),
										{ price }
									) }
								>
									{ price }
								</Text>
							</HStack>
						</VStack>
					</HStack>
					{ errorMessage && (
						<Notice status="error" onRemove={ removeErrorMessage }>
							{ errorMessage }
						</Notice>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
};
