import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { arrowUpRight } from '@wordpress/icons';
import type { ReactNode } from 'react';

export default function LinkCard( {
	href,
	header,
	children,
}: {
	href: string;
	header: ReactNode;
	children?: ReactNode;
} ) {
	return (
		<Card
			as="a"
			className="wpnc-simplified__card"
			href={ href }
			target="_blank"
			rel="noreferrer"
			size="small"
		>
			<CardBody>
				<VStack spacing={ 3 }>
					<HStack alignment="top" justify="space-between" spacing={ 3 }>
						{ header }
						<Icon className="wpnc-simplified__card-arrow" icon={ arrowUpRight } size={ 20 } />
					</HStack>
					{ children }
				</VStack>
			</CardBody>
		</Card>
	);
}
