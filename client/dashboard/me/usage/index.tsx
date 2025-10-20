import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';

function getMonthToDateRange( locale: string ) {
	const now = new Date();
	const start = new Date( now.getFullYear(), now.getMonth(), 1 );
	const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
	const startText = formatDate( start, locale, options );
	const endText = formatDate( now, locale, options );
	// Use LRM around en dash for RTL safety
	return `${ startText }\u200E–\u200E${ endText }`;
}

function Usage() {
	// Skeleton layout only; charts/cards to be implemented in later tasks
	const locale = useLocale();
	return (
		<PageLayout
			size="large"
			header={
				<PageHeader title={ __( 'Usage' ) } description={ getMonthToDateRange( locale ) } />
			}
		>
			<VStack spacing={ 8 } alignment="stretch">
				<HStack spacing={ 8 } wrap alignment="stretch">
					<Card>{ __( 'Overall usage (pie) – coming soon' ) }</Card>
					<Card>{ __( 'Sites usage list – coming soon' ) }</Card>
				</HStack>

				<VStack spacing={ 8 } alignment="stretch">
					<Card>{ __( 'Bandwidth over time – coming soon' ) }</Card>
					<Card>{ __( 'Storage over time – coming soon' ) }</Card>
				</VStack>
			</VStack>
		</PageLayout>
	);
}

export default Usage;
