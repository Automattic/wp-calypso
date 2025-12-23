import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { close, info } from '@wordpress/icons';
import { intlFormat } from 'date-fns';
import { Text } from '../../../components/text';
import type { Purchase, CancellationFeature } from '@automattic/api-core';

type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => string;
};

const CancelPurchaseFeatureList = ( {
	purchase,
	cancellationFeatures,
	cancellationChanges,
}: {
	purchase: Purchase;
	cancellationFeatures: CancellationFeature[];
	cancellationChanges: FeatureObject[];
} ) => {
	if ( ! cancellationFeatures.length && ! cancellationChanges.length ) {
		return;
	}

	const { expiry_date: expiryDate } = purchase;
	const expirationDate = intlFormat( expiryDate, { dateStyle: 'medium' }, { locale: 'en-US' } );
	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 2 }>
				<Text as="p">
					{ sprintf(
						/* translators: %(expire)s is the date the product will expire */
						__( 'Your purchase will expire on %(expiry)s and you’ll lose access to:' ),
						{
							expiry: expirationDate,
						}
					) }
				</Text>
				<VStack as="ul" spacing={ 1 } style={ { listStyle: 'none', padding: 0, margin: 0 } }>
					{ cancellationFeatures.map( ( feature ) => {
						if ( ! feature ) {
							return null;
						}
						return (
							<li key={ feature.feature_id }>
								<HStack alignment="topLeft">
									<Icon
										size={ 20 }
										icon={ close }
										style={ { flexShrink: 0, fill: 'var( --dashboard__foreground-color-error )' } }
									/>
									<span>{ feature.title }</span>
								</HStack>
							</li>
						);
					} ) }
				</VStack>
			</VStack>
			{ cancellationChanges.length > 0 && (
				<VStack spacing={ 2 }>
					<Text as="p">{ __( 'We will also make these changes to your site:' ) }</Text>
					<VStack as="ul" spacing={ 1 } style={ { listStyle: 'none', padding: 0, margin: 0 } }>
						{ cancellationChanges.map( ( change ) => {
							return (
								<li key={ change.getSlug() }>
									<HStack alignment="topLeft">
										<Icon
											size={ 20 }
											icon={ info }
											style={ {
												flexShrink: 0,
												fill: 'var( --dashboard__foreground-color-warning )',
											} }
										/>
										<span>{ change.getTitle() }</span>
									</HStack>
								</li>
							);
						} ) }
					</VStack>
				</VStack>
			) }
		</VStack>
	);
};

export default CancelPurchaseFeatureList;
