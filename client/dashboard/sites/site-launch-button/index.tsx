import { domainsQuery } from '@automattic/api-queries';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { NoticeActionButton, NoticeActionLinkButton } from '../../components/notice';
import { useSiteLaunch, type A4aLaunchModalComponent } from './use-site-launch';
import type { Site } from '@automattic/api-core';

interface SiteLaunchButtonProps {
	site: Site;
	tracksContext: string;
	launchUrl?: string;
	LaunchModal?: A4aLaunchModalComponent;
	flowDestination?: string;
}

function useSiteLaunchButton( {
	site,
	tracksContext,
	launchUrl,
	LaunchModal,
	flowDestination,
}: SiteLaunchButtonProps ) {
	const { recordTracksEvent } = useAnalytics();

	return useSiteLaunch( site, {
		tracksContext,
		flowDestination,
		a4aLaunchUrl: launchUrl,
		a4aLaunchModal: LaunchModal,
		domainsOptions: domainsQuery(),
		recordTracksEvent,
	} );
}

export function SiteLaunchButton( props: SiteLaunchButtonProps ) {
	const { isLoading, isExperimentLoading, isHidden, isDisabled, isBusy, href, onClick, modal } =
		useSiteLaunchButton( props );

	if ( isLoading || isHidden ) {
		return null;
	}

	return (
		<>
			<Button
				size="compact"
				variant="primary"
				disabled={ isDisabled || isExperimentLoading }
				isBusy={ isBusy }
				href={ href }
				onClick={ onClick }
			>
				{ __( 'Launch your site' ) }
			</Button>
			{ modal }
		</>
	);
}

/**
 * `SiteLaunchButton` for a notice's `actions`.
 */
export function SiteLaunchNoticeAction( props: SiteLaunchButtonProps ) {
	const { isLoading, isExperimentLoading, isHidden, isDisabled, isBusy, href, onClick, modal } =
		useSiteLaunchButton( props );

	if ( isLoading || isHidden ) {
		return null;
	}

	// Pick the element from the site alone, not from the experiment loading state,
	// so it isn't swapped mid-render: that crashes React under Google Translate
	// (react/react#11538).
	return (
		<>
			{ href && ! isDisabled ? (
				<NoticeActionLinkButton
					variant="solid"
					href={ href }
					aria-disabled={ isExperimentLoading || undefined }
					onClick={ ( event: React.MouseEvent< HTMLAnchorElement > ) => {
						if ( isExperimentLoading ) {
							event.preventDefault();
							return;
						}
						onClick();
					} }
				>
					{ __( 'Launch your site' ) }
				</NoticeActionLinkButton>
			) : (
				<NoticeActionButton
					variant="solid"
					disabled={ isDisabled || isExperimentLoading }
					loading={ isBusy }
					onClick={ onClick }
				>
					{ __( 'Launch your site' ) }
				</NoticeActionButton>
			) }
			{ modal }
		</>
	);
}
