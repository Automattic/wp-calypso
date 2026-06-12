import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SecurityLegacyContactSummary( { density }: { density?: Density } ) {
	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/security/legacy-contact"
			title={ __( 'Legacy contact' ) }
			description={ __( 'Choose someone you trust to manage your account after your death.' ) }
			decoration={ <Icon icon={ people } /> }
		/>
	);
}
