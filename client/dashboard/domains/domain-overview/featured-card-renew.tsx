import {
	Card,
	CardBody,
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { calendar } from '@wordpress/icons';
import { useLocale } from '../../app/locale';
import { Domain } from '../../data/domain';
import { formatDate } from '../../utils/datetime';

interface Props {
	domain: Domain;
}

export default function FeaturedCardRenew( { domain }: Props ) {
	const locale = useLocale();
	const date = domain.auto_renewing ? domain.auto_renewal_date : domain.renewable_until;

	const formattedDate = formatDate( new Date( date ), locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	} );

	return (
		<Card className="featured-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 2 } justify="flex-start">
						<Icon icon={ calendar } size={ 24 } />
						<Text className="featured-card__title" upperCase size="footnote">
							{ __( 'Renews' ) }
						</Text>
					</HStack>
					<VStack>
						<Text size="title" weight={ 500 }>
							{ formattedDate }
						</Text>
						<Text className="featured-card__body" size="body">
							{ domain.auto_renewing
								? __( 'Auto-renew is enabled.' )
								: __( 'Auto-renew is disabled.' ) }
						</Text>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
