import {
	rawUserPreferencesQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { _n, __, sprintf } from '@wordpress/i18n';
import {
	Notice,
	NoticeActionLinkButton,
	RouterNoticeActionLinkButton,
} from '../../components/notice';
import { DIRECTORY_NAMES } from './lib';
import type { AgencyPartnerDirectorySlug, UserPreferences } from '@automattic/api-core';

const PREFERENCE_NAME = 'a4a-dashboard-pd-not-approved-popover';

interface NotApprovedNoticeProps {
	rejectedDirectories: AgencyPartnerDirectorySlug[];
	expertiseUrl: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	shouldUseRouterLink?: boolean;
}

export default function NotApprovedNotice( {
	rejectedDirectories,
	expertiseUrl,
	recordTracksEvent,
	shouldUseRouterLink = true,
}: NotApprovedNoticeProps ) {
	const queryClient = useQueryClient();
	const { data: isDismissed } = useQuery( {
		...userPreferenceQuery( PREFERENCE_NAME ),
		// The dismissal only ever changes through this notice, so avoid
		// refetching the preferences on every visit to the screen.
		staleTime: 5 * 60 * 1000,
	} );
	const { mutate: savePreference } = useMutation( userPreferenceMutation( PREFERENCE_NAME ) );

	if ( isDismissed !== false || rejectedDirectories.length === 0 ) {
		return null;
	}

	const dismiss = ( eventName: string ) => {
		// Write through the host app's query client: the mutation's own cache
		// update targets the MSD singleton, which the classic app doesn't read.
		queryClient.setQueryData< UserPreferences >(
			rawUserPreferencesQuery().queryKey,
			( previous ) => ( {
				...previous,
				[ PREFERENCE_NAME ]: true,
			} )
		);
		savePreference( true );
		recordTracksEvent( eventName );
	};

	const title =
		rejectedDirectories.length === 1
			? sprintf(
					/* translators: %s is a Partner Directory name, e.g. WordPress.com */
					__( 'Your agency wasn’t approved for %s.' ),
					DIRECTORY_NAMES[ rejectedDirectories[ 0 ] ]
				)
			: sprintf(
					/* translators: %s is the number of Partner Directories, always 2 or more. */
					_n(
						'Your agency wasn’t approved for %s directory.',
						'Your agency wasn’t approved for %s directories.',
						rejectedDirectories.length
					),
					formatNumber( rejectedDirectories.length )
				);

	const onUpdateClick = () =>
		dismiss( 'calypso_a4a_partner_directory_dashboard_update_expertise_click' );
	const updateLabel = __( 'Update my expertise' );

	return (
		<Notice
			variant="warning"
			title={ title }
			actions={
				shouldUseRouterLink && expertiseUrl.startsWith( '/' ) ? (
					<RouterNoticeActionLinkButton to={ expertiseUrl } onClick={ onUpdateClick }>
						{ updateLabel }
					</RouterNoticeActionLinkButton>
				) : (
					<NoticeActionLinkButton href={ expertiseUrl } onClick={ onUpdateClick }>
						{ updateLabel }
					</NoticeActionLinkButton>
				)
			}
			onClose={ () => dismiss( 'calypso_a4a_partner_directory_dashboard_do_it_later_click' ) }
		>
			{ __( 'Please check your email for feedback from our review team.' ) }
		</Notice>
	);
}
