import { useHasEnTranslation } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';

export function useSslStatusLabels() {
	const hasEnTranslation = useHasEnTranslation();

	return {
		active: __( 'SSL active' ),
		pending: hasEnTranslation( 'SSL pending' ) ? __( 'SSL pending' ) : __( 'SSL Pending' ),
		disabled: hasEnTranslation( 'SSL disabled' ) ? __( 'SSL disabled' ) : __( 'SSL Disabled' ),
	};
}
