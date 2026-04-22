import { readerChatSettingsMutation, readerChatSettingsQuery } from '@automattic/api-queries';
import { Card } from '@automattic/components';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ExternalLink, ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function ReaderChatCard() {
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );
	const site = useSelector( getSelectedSite );

	const { data: settings } = useQuery( {
		...readerChatSettingsQuery( siteId ?? 0 ),
		enabled: Boolean( siteId ),
	} );
	const isEnabled = settings?.enabled ?? false;

	const mutation = useMutation( {
		...readerChatSettingsMutation( siteId ?? 0 ),
	} );

	if ( ! siteId ) {
		return null;
	}

	const handleToggle = ( next: boolean ) => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_search_reader_chat_toggled', {
				enabled: next,
				site_id: siteId,
			} )
		);
		mutation.mutate( { enabled: next } );
	};

	const guidelinesHref = site?.options?.admin_url
		? `${ site.options.admin_url }site-editor.php?canvas=edit&path=/guidelines/additional`
		: undefined;

	return (
		<Card>
			<h2 className="jetpack-search__header">{ translate( 'Reader Chat' ) }</h2>
			<p>
				{ translate( 'Let readers ask your blog questions and get answers from your content.' ) }
			</p>
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ isEnabled }
				disabled={ mutation.isPending }
				label={ translate( 'Enable Reader Chat on your blog' ) }
				onChange={ handleToggle }
			/>
			{ isEnabled && guidelinesHref && (
				<p>
					<ExternalLink href={ guidelinesHref }>
						{ translate( 'Set content guidelines' ) }
					</ExternalLink>
				</p>
			) }
		</Card>
	);
}
