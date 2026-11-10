import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../../components/card';
import { TextSkeleton } from '../../components/text-skeleton';
import type { ComponentProps, CSSProperties } from 'react';

// Holds the card's place while the code loads. It shows no real copy, because
// an agency without an active coupon gets no card at all.
export default function CertificationCardSkeleton( {
	size,
	style,
}: {
	size?: ComponentProps< typeof Card >[ 'size' ];
	style?: CSSProperties;
} ) {
	return (
		<Card size={ size } style={ style } aria-hidden="true">
			<CardBody>
				<VStack spacing={ 4 } alignment="flex-start">
					<TextSkeleton length={ 30 } />
					<VStack spacing={ 1 }>
						<TextSkeleton length={ 60 } />
						<TextSkeleton length={ 45 } />
					</VStack>
					<TextSkeleton length={ 24 } />
					<TextSkeleton length={ 16 } />
				</VStack>
			</CardBody>
		</Card>
	);
}
