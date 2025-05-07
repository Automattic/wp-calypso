import { ExternalLink } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useMemo, useState } from 'react';
import Notice from 'calypso/components/notice';
import version_compare from 'calypso/lib/version-compare';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';

interface ExternalProps {
	siteId: number;
	minJetpackVersion: string;
	warningRequirement?: string;
}

/**
 * Show a warning Notice if the current site has a Jetpack version prior to `minJetpackVersion`.
 * @param {Object} props - the id of the current site
 * @param {number} props.siteId – the ID of the current site
 * @param {string} props.minJetpackVersion – the minimum accepted Jetpack version
 * @param {string?} props.warningRequirement – the requirement that triggered the warning
 */
export const JetpackPluginUpdateWarning: FC< ExternalProps > = ( {
	siteId,
	minJetpackVersion,
	warningRequirement,
}: ExternalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isDismissed, setIsDismissed ] = useState( false );

	const siteJetpackVersion =
		useSelector( ( state ) => getSiteOption( state, siteId, 'jetpack_version' ) ) ?? 0;

	const pluginUpgradeUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'update-core.php#update-plugins-table' )
	);

	const hideWarning = useMemo(
		() => version_compare( siteJetpackVersion, minJetpackVersion, '>=' ) || ! pluginUpgradeUrl,
		[ minJetpackVersion, pluginUpgradeUrl, siteJetpackVersion ]
	);

	const dismissClick = useCallback( () => {
		setIsDismissed( true );
		dispatch( recordTracksEvent( 'calypso_jetpack_plugin_update_warning_dismiss' ) );
	}, [ dispatch, setIsDismissed ] );

	const updatePluginClick = useCallback( () => {
		setIsDismissed( true );
		dispatch( recordTracksEvent( 'calypso_jetpack_plugin_update_warning_click' ) );
	}, [ dispatch, setIsDismissed ] );

	if ( hideWarning || isDismissed || ! pluginUpgradeUrl ) {
		return null;
	}

	return (
		<Notice onDismissClick={ dismissClick } status="is-warning">
			{ translate(
				'Your Jetpack plugin is out of date. ' +
					'{{WarningRequirement/}}, {{JetpackUpdateLink}}update Jetpack{{/JetpackUpdateLink}}.',
				{
					components: {
						JetpackUpdateLink: (
							<ExternalLink
								href={ pluginUpgradeUrl }
								onClick={ updatePluginClick }
								target="_blank"
							/>
						),
						WarningRequirement: (
							<>
								{ warningRequirement ??
									translate( 'To make sure it will work with our recommended plans' ) }
							</>
						),
					},
				}
			) }
		</Notice>
	);
};

export default JetpackPluginUpdateWarning;
