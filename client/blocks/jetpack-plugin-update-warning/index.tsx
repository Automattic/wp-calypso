import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import Notice from 'calypso/components/notice';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';

interface ExternalProps {
	siteId: number;
	minJetpackVersion: string;
}

/**
 * Show a warning Notice if the current site has a Jetpack version prior to `minJetpackVersion`.
 *
 * @param {Object} props - the id of the current site
 * @param {number} props.siteId – the ID of the current site
 * @param {string} props.minJetpackVersion – the minimum accepted Jetpack version
 */
export const JetpackPluginUpdateWarning: FC< ExternalProps > = ( {
	siteId,
	minJetpackVersion,
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
		() => siteJetpackVersion >= minJetpackVersion || ! pluginUpgradeUrl,
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

	if ( hideWarning || isDismissed ) {
		return null;
	}

	return (
		<Notice onDismissClick={ dismissClick } status="is-warning">
			{ preventWidows(
				translate(
					'Your Jetpack plugin is out of date. ' +
						'To make sure it will work with our recommended' +
						' plans, {{JetpackUpdateLink}}update Jetpack{{/JetpackUpdateLink}}.',
					{
						components: {
							JetpackUpdateLink: (
								<ExternalLink
									href={ pluginUpgradeUrl }
									onClick={ updatePluginClick }
									target="_blank"
								/>
							),
						},
					}
				)
			) }
		</Notice>
	);
};

export default JetpackPluginUpdateWarning;
