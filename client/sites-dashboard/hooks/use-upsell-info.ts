import { useI18n } from '@wordpress/react-i18n';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

export function useUpsellInfo( site: SiteExcerptData ): string {
	const { __ } = useI18n();
	return site.is_wpcom_atomic ? __( 'Included in your plan' ) : __( 'Requires a Business Plan' );
}
