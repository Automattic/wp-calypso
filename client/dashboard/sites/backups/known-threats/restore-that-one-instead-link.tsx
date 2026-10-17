import { __ } from '@wordpress/i18n';
import RouterLinkButton from '../../../components/router-link-button';

interface RestoreThatOneInsteadLinkProps {
	siteSlug: string;
	restoreLinkTo?: string;
	latestWithoutKnownThreats?: number | null;
	/** The backup period containing the backup being viewed, if known. */
	currentBackupPeriod?: number | null;
}

export function RestoreThatOneInsteadLink( {
	siteSlug,
	restoreLinkTo,
	latestWithoutKnownThreats,
	currentBackupPeriod,
}: RestoreThatOneInsteadLinkProps ) {
	if ( ! restoreLinkTo ) {
		return null;
	}

	if ( latestWithoutKnownThreats === null || latestWithoutKnownThreats === undefined ) {
		return null;
	}

	if ( currentBackupPeriod === latestWithoutKnownThreats ) {
		return null;
	}

	return (
		<RouterLinkButton
			__next40pxDefaultSize
			variant="link"
			to={ restoreLinkTo }
			params={ { siteSlug, rewindId: String( latestWithoutKnownThreats ) } }
		>
			{ __( 'Restore this one instead' ) }
		</RouterLinkButton>
	);
}
