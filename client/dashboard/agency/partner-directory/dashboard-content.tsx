import { agencyPartnerDirectoryApplicationMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import ActionList from '../../components/action-list';
import { Card, CardBody } from '../../components/card';
import IconList from '../../components/icon-list';
import { SectionHeader } from '../../components/section-header';
import { getBrandMeta } from './get-brand-meta';
import {
	DIRECTORY_NAMES,
	getDirectoryStatusBadge,
	hasApprovedDirectory,
	isAgencyProfileComplete,
	isApplicationCompleted,
} from './lib';
import LinkButton from './link-button';
import StatusBadge from './status-badge';
import type { DirectoryStatusBadge } from './lib';
import type { Agency, AgencyPartnerDirectorySlug, AgencyProfile } from '@automattic/api-core';

const KB_APPROVAL_PROCESS_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-directory-listings';
const KB_PROFILE_CONTENT_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-directory-listings/#profile-content';

/**
 * The minimal agency shape the dashboard needs. Kept structural so both the
 * dashboard (`@automattic/api-core` agency) and the A4A client (Redux agency)
 * can provide it.
 */
interface PartnerDirectoryDashboardAgency {
	id: number;
	name: string;
	profile?: AgencyProfile | null;
}

interface DirectoryStatus {
	directory: AgencyPartnerDirectorySlug;
	badge: DirectoryStatusBadge;
}

interface Props {
	agency: PartnerDirectoryDashboardAgency;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	expertiseUrl: string;
	profileUrl: string;
	onPublishSuccess?: ( agency: Agency ) => void;
	onPublishError?: () => void;
	openSupportGuide?: ( url: string ) => void;
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so link
	 * buttons render plain anchors for the host app's own router to pick up.
	 */
	shouldUseRouterLink?: boolean;
}

/*
 * Shared by the dashboard snackbar and the classic app's notices so the two
 * hosts can't drift apart.
 */
export const getProfilePublishedMessage = () => __( 'Profile published.' );
export const getProfilePublishFailedMessage = () => __( 'Failed to publish profile.' );

export default function PartnerDirectoryDashboardContent( {
	agency,
	recordTracksEvent,
	expertiseUrl,
	profileUrl,
	onPublishSuccess,
	onPublishError,
	openSupportGuide,
	shouldUseRouterLink,
}: Props ) {
	const profile = agency.profile;
	const application = profile?.partner_directory_application;
	const isMobile = useViewportMatch( 'mobile', '<' );
	const itemLayout = isMobile ? 'stacked' : 'inline';

	const { mutate: publishProfile, isPending: isPublishingProfile } = useMutation(
		withSnackbar( agencyPartnerDirectoryApplicationMutation( agency.id ), {
			success: getProfilePublishedMessage(),
			error: getProfilePublishFailedMessage(),
		} )
	);

	const applicationWasSubmitted = application ? application.status !== 'completed' : false;
	const isProfileComplete = isAgencyProfileComplete( profile );
	const isCompleted = isApplicationCompleted( application );

	const directories = application?.directories ?? [];

	const directoryStatuses: DirectoryStatus[] = directories.map( ( { directory, status } ) => ( {
		directory,
		badge: getDirectoryStatusBadge( status ),
	} ) );

	const hasDirectoryApproval = hasApprovedDirectory( application );
	// The "not approved" popover only auto-opens for a single, unambiguous rejection.
	const showPopoverOnLoad =
		directories.filter( ( { status } ) => status === 'rejected' ).length === 1;

	const onApplyNowClick = () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_dashboard_apply_now_click' );
	};

	const onFinishProfileClick = () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_dashboard_finish_profile_click' );
	};

	const onEditExpertiseClick = () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_dashboard_edit_expertise_click' );
	};

	const onEditProfileClick = () => {
		recordTracksEvent( 'calypso_a4a_partner_directory_dashboard_edit_profile_click' );
	};

	const onPublishProfileClick = () => {
		if ( ! profile || ! application ) {
			return;
		}

		recordTracksEvent( 'calypso_a4a_partner_directory_dashboard_publish_profile_click' );

		publishProfile(
			{
				services: profile.listing_details.services ?? [],
				products: profile.listing_details.products ?? [],
				directories: directories.map( ( { directory, urls, note } ) => ( {
					directory,
					urls,
					note,
				} ) ),
				feedback_url: application.feedback_url,
				is_published: true,
			},
			{
				onSuccess: ( updatedAgency ) => onPublishSuccess?.( updatedAgency ),
				onError: () => onPublishError?.(),
			}
		);
	};

	const supportGuideLink = ( url: string, label: string ) =>
		openSupportGuide ? (
			<Button variant="link" onClick={ () => openSupportGuide( url ) }>
				{ label }
			</Button>
		) : (
			<ExternalLink href={ url }>{ label }</ExternalLink>
		);

	const learnMoreSection = (
		<VStack spacing={ 3 } alignment="flex-start">
			<SectionHeader level={ 3 } title={ __( 'Learn more about the program' ) } />
			{ supportGuideLink( KB_APPROVAL_PROCESS_URL, __( 'How does the approval process work?' ) ) }
			{ supportGuideLink( KB_PROFILE_CONTENT_URL, __( 'What can I put on my public profile?' ) ) }
		</VStack>
	);

	const directoryStatusBadges = (
		// The extra block-start padding separates the badges from the item title,
		// which sits closer to plain-text descriptions than to badge chips.
		<VStack spacing={ 2 } as="span" style={ { paddingBlockStart: '4px' } }>
			{ directoryStatuses.map( ( { directory, badge } ) => {
				const brandMeta = getBrandMeta( directory );
				return (
					<HStack key={ directory } spacing={ 2 } justify="flex-start" as="span">
						<StatusBadge
							badge={ badge }
							showPopoverOnLoad={ showPopoverOnLoad }
							expertiseUrl={ expertiseUrl }
							recordTracksEvent={ recordTracksEvent }
							shouldUseRouterLink={ shouldUseRouterLink }
						/>
						{ badge.key === 'approved' && brandMeta.isAvailable ? (
							<ExternalLink href={ brandMeta.url }>
								{ DIRECTORY_NAMES[ directory ] }
							</ExternalLink>
						) : (
							<Text>{ DIRECTORY_NAMES[ directory ] }</Text>
						) }
					</HStack>
				);
			} ) }
		</VStack>
	);

	// The application is completed: at least one directory was approved and published.
	if ( isCompleted ) {
		const approvedCount = directoryStatuses.filter(
			( { badge } ) => badge.key === 'approved'
		).length;

		return (
			<VStack spacing={ 8 }>
				<SectionHeader
					title={ _n(
						'Congratulations! Your agency is now listed in our Partner Directory.',
						'Congratulations! Your agency is now listed in our Partner Directories.',
						approvedCount
					) }
				/>
				<Card>
					<CardBody>
						<VStack spacing={ 6 }>
							{ directoryStatuses.map( ( { directory, badge } ) => {
								const brandMeta = getBrandMeta( directory, agency );

								return (
									<IconList.Item
										key={ directory }
										decoration={ brandMeta.icon }
										title={ DIRECTORY_NAMES[ directory ] }
										description={
											badge.key === 'approved' && brandMeta.isAvailable ? (
												<VStack spacing={ 1 } alignment="flex-start" as="span">
													<ExternalLink href={ brandMeta.url }>
														{ sprintf(
															/* translators: %s is the brand name, e.g. WordPress.com */
															__( '%s Partner Directory' ),
															DIRECTORY_NAMES[ directory ]
														) }
													</ExternalLink>
													<ExternalLink href={ brandMeta.profileUrl }>
														{ __( 'Your agency’s profile' ) }
													</ExternalLink>
												</VStack>
											) : (
												<VStack spacing={ 1 } alignment="flex-start" as="span">
													{ /* No auto-open here: it would cover the congratulations screen. */ }
													<StatusBadge
														badge={ badge }
														showPopoverOnLoad={ false }
														expertiseUrl={ expertiseUrl }
														recordTracksEvent={ recordTracksEvent }
														shouldUseRouterLink={ shouldUseRouterLink }
													/>
													{ badge.key === 'approved' && ! brandMeta.isAvailable && (
														<Text>{ __( 'This Partner Directory is launching soon.' ) }</Text>
													) }
												</VStack>
											)
										}
									/>
								);
							} ) }
						</VStack>
					</CardBody>
				</Card>
				<SectionHeader
					level={ 3 }
					title={ __( 'Edit your agency’s information' ) }
					description={ __(
						'Expand to more Automattic directories by adding products or updating your agency’s profile.'
					) }
					actions={
						<>
							<LinkButton
								variant="secondary"
								href={ expertiseUrl }
								onClick={ onEditExpertiseClick }
								shouldUseRouterLink={ shouldUseRouterLink }
							>
								{ __( 'Edit expertise' ) }
							</LinkButton>
							<LinkButton
								variant="secondary"
								href={ profileUrl }
								onClick={ onEditProfileClick }
								shouldUseRouterLink={ shouldUseRouterLink }
							>
								{ __( 'Edit profile' ) }
							</LinkButton>
						</>
					}
				/>
				{ learnMoreSection }
			</VStack>
		);
	}

	return (
		<VStack spacing={ 8 }>
			<SectionHeader
				title={ __( 'Boost your agency’s visibility across Automattic listings.' ) }
				description={ __(
					'List your agency in our Partner Directories. Showcase your skills, attract clients, and grow your business.'
				) }
			/>
			<VStack spacing={ 4 }>
				<SectionHeader level={ 3 } title={ __( 'How do I start?' ) } />
				<ActionList>
					<ActionList.ActionItem
						layout={ itemLayout }
						suffixAlignment={
							applicationWasSubmitted && directoryStatuses.length > 0 ? 'top' : undefined
						}
						title={ __( 'Share your expertise' ) }
						description={
							applicationWasSubmitted && directoryStatuses.length > 0
								? directoryStatusBadges
								: __(
										'Pick your agency’s specialties and choose your directories. We’ll review your application.'
								  )
						}
						actions={
							<LinkButton
								variant={ applicationWasSubmitted ? 'secondary' : 'primary' }
								href={ expertiseUrl }
								onClick={ applicationWasSubmitted ? onEditExpertiseClick : onApplyNowClick }
								shouldUseRouterLink={ shouldUseRouterLink }
							>
								{ applicationWasSubmitted ? __( 'Edit expertise' ) : __( 'Apply now' ) }
							</LinkButton>
						}
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						layout={ itemLayout }
						title={ __( 'Finish adding details to your public profile' ) }
						description={ __(
							'When approved, add details to your agency’s public profile for clients to see.'
						) }
						actions={
							<LinkButton
								variant={
									applicationWasSubmitted && hasDirectoryApproval && ! isProfileComplete
										? 'primary'
										: 'secondary'
								}
								href={ profileUrl }
								onClick={ onFinishProfileClick }
								disabled={ ! applicationWasSubmitted || ! hasDirectoryApproval }
								shouldUseRouterLink={ shouldUseRouterLink }
							>
								{ isProfileComplete ? __( 'Edit profile' ) : __( 'Finish profile' ) }
							</LinkButton>
						}
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						layout={ itemLayout }
						title={ __( 'New clients will find you' ) }
						description={ __(
							'Your agency will appear in the Partner Directories you select and get approved for, including WordPress.com, Woo.com, Pressable.com, and Jetpack.com.'
						) }
						actions={
							<Button
								variant={ applicationWasSubmitted ? 'primary' : 'secondary' }
								onClick={ onPublishProfileClick }
								disabled={
									! applicationWasSubmitted ||
									! hasDirectoryApproval ||
									! isProfileComplete ||
									isPublishingProfile
								}
								isBusy={ isPublishingProfile }
							>
								{ __( 'Done' ) }
							</Button>
						}
					/>
				</ActionList>
			</VStack>
			{ learnMoreSection }
		</VStack>
	);
}
