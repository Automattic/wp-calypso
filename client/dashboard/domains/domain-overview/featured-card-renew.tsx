import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { Domain } from '../../data/domain';
import { formatDate } from '../../utils/datetime';

interface Props {
	domain: Domain;
}

export default function FeaturedCardRenew( { domain }: Props ) {
	const locale = useLocale();

	const formattedDate = formatDate( new Date( domain.renewable_until ), locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	} );

	return (
		<Card>
			<CardBody>
				<VStack>
					<Text size="title" weight="500">
						{ formattedDate }
					</Text>
					<Text size="body">{ __( 'Auto-renew is enabled.' ) }</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}
