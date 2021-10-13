import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import MaterialIcon from 'calypso/components/material-icon';
import { stripHTML } from 'calypso/lib/formatting/strip-html';
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function RestorePlanSoftwareCard() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	function requestRestore() {
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
		<Card className="restore-plan-software-card">
			<MaterialIcon icon="apps" />
			<CardHeading>{ translate( 'Restore Plugins and Themes' ) }</CardHeading>
			<p>
				{ translate(
					'If your website is missing plugins and themes that come with your plan, you may restore them here.'
				) }
			</p>
			<Button primary onClick={ requestRestore }>
				{ translate( "Restore Plugins and Themes for My Website's Plan" ) }
			</Button>
		</Card>
	);
}
