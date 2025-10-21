import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';
import FlexUsageCard from './components/flex-usage-card';

function getMonthToDateRange( locale: string ) {
	const now = new Date();
	const start = new Date( now.getFullYear(), now.getMonth(), 1 );
	const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
	const startText = formatDate( start, locale, options );
	const endText = formatDate( now, locale, options );
	// Use LRM around en dash for RTL safety
	return `${ startText }\u200E–\u200E${ endText }`;
}

function FlexUsage() {
	// Skeleton layout only; charts/cards to be implemented in later tasks
	const locale = useLocale();
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	return (
		<PageLayout
			size="large"
			header={
				<PageHeader title={ __( 'Usage' ) } description={ getMonthToDateRange( locale ) } />
			}
		>
			<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
				<HStack wrap alignment="stretch" spacing={ isSmallViewport ? 4 : 8 }>
					<FlexUsageCard
						title={ __( 'Plan usage' ) }
						description={ __( 'This section provides an overview of your plan usage.' ) }
						isLoading={ false }
					></FlexUsageCard>
					<FlexUsageCard
						title={ __( 'Sites usage' ) }
						description={ __( 'See how each site contributes to your total resource usage.' ) }
						isLoading={ false }
					></FlexUsageCard>
				</HStack>
				<FlexUsageCard
					title={ __( 'Bandwidth' ) }
					description={ __(
						'The bandwidth report shows the total data your site has transmitted. Chart reflects GMT/UTC time.'
					) }
					isLoading={ false }
				></FlexUsageCard>
				<FlexUsageCard
					title={ __( 'Storage' ) }
					description={ __( 'The disk space report shows usage compared to the account limit.' ) }
					isLoading={ false }
				></FlexUsageCard>
			</VStack>
		</PageLayout>
	);
}

export default FlexUsage;
