/**
 * Internal dependencies
 */
import { getDomainTypeText } from 'lib/domains';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

export const recordPaymentSettingsClick = ( domain ) => {
	const domainType = getDomainTypeText( domain );

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			`Clicked "Payment Settings" Button on a ${ domainType } in Edit`,
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_edit_payment_settings_click', {
			section: domain.type,
		} )
	);
};
