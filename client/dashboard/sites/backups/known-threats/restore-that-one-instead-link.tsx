import { getBackupPeriod } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { siteBackupRestoreRoute } from '../../../app/router/sites';
import RouterLinkButton from '../../../components/router-link-button';

interface RestoreThatOneInsteadLinkProps {
	siteSlug: string;
	latestWithoutKnownThreats?: number | null;
	currentRewindId?: string;
}

export function RestoreThatOneInsteadLink( {
	siteSlug,
	latestWithoutKnownThreats,
	currentRewindId,
}: RestoreThatOneInsteadLinkProps ) {
	if ( latestWithoutKnownThreats === null || latestWithoutKnownThreats === undefined ) {
		return null;
	}

	if (
		currentRewindId !== undefined &&
		getBackupPeriod( currentRewindId ) === latestWithoutKnownThreats
	) {
		return null;
	}

	return (
		<RouterLinkButton
			variant="link"
			to={ siteBackupRestoreRoute.fullPath }
			params={ { siteSlug, rewindId: String( latestWithoutKnownThreats ) } }
		>
			{ __( 'Restore that one instead' ) }
		</RouterLinkButton>
	);
}
