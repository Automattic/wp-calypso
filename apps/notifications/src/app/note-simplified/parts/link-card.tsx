import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import { arrowUpRight } from '@wordpress/icons';
import { recordTracksEvent } from '../../../panel/helpers/stats';
import type { ReactNode } from 'react';

export default function LinkCard( {
	card,
	href,
	header,
	children,
}: {
	card: 'post' | 'site';
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
			onClick={ () => recordTracksEvent( 'calypso_notification_context_card_click', { card } ) }
		>
			<CardBody className="wpnc-simplified__card-body" size="none">
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
