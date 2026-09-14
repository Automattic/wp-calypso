import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import { stripHTML } from 'calypso/lib/formatting/strip-html';
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function RestorePlanSoftwareCard() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	function requestRestore() {
		dispatch( recordTracksEvent( 'calypso_hosting_restore_plugins_and_themes' ) );
		wpcom.req
			.post( {
				path: `/sites/${ siteId }/hosting/restore-plan-software`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( () => {
				dispatch(
					successNotice(
						translate( 'Requested restoration of plugins and themes that come with your plan.' )
					)
				);
			} )
			.catch( ( error ) => {
				const message =
					stripHTML( error.message ) ||
					translate( 'Failed to request restoration of plan plugin and themes.' );
				dispatch( errorNotice( message ) );
			} );
	}

	return (
		<HostingCard
			className="restore-plan-software-card"
			title={ translate( 'Restore plugins and themes' ) }
		>
			<HostingCardDescription>
				{ translate(
					'If your website is missing plugins and themes that come with your plan, you may restore them here.'
				) }
			</HostingCardDescription>
			<Button onClick={ requestRestore }>{ translate( 'Restore' ) }</Button>
		</HostingCard>
	);
}
