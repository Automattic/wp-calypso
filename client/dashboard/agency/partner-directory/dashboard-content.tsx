import { agencyPartnerDirectoryApplicationMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf, _n, __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import ActionList from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';
import { getBrandMeta } from './get-brand-meta';
import {
	DIRECTORY_NAMES,
	getDirectoryStatusBadge,
	isAgencyProfileComplete,
	isApplicationCompleted,
} from './lib';
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
export interface PartnerDirectoryDashboardAgency {
	id: number;
	name: string;
	profile?: AgencyProfile | null;
}

interface DirectoryStatus {
	directory: AgencyPartnerDirectorySlug;
	badge: DirectoryStatusBadge;
}

interface Props {
	agency?: PartnerDirectoryDashboardAgency | null;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	expertiseUrl: string;
	profileUrl: string;
	onPublishSuccess?: ( agency: Agency ) => void;
	openSupportGuide?: ( url: string ) => void;
}

/**
 * Shared by the dashboard snackbar and the classic app's success notice so
 * the two hosts can't drift apart.
 */
export const getProfileSavedMessage = () => __( 'Your profile has been saved!' );

export default function PartnerDirectoryDashboardContent( {
	agency,
	recordTracksEvent,
	expertiseUrl,
	profileUrl,
	onPublishSuccess,
	openSupportGuide,
}: Props ) {
	const profile = agency?.profile;
	const application = profile?.partner_directory_application;

	const { mutate: publishProfile, isPending: isPublishingProfile } = useMutation(
		withSnackbar( agencyPartnerDirectoryApplicationMutation( agency?.id ?? 0 ), {
			success: getProfileSavedMessage(),
			error: __( 'Failed to publish your profile.' ),
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

	const hasDirectoryApproval = directories.some( ( { status } ) => status === 'approved' );
	// The "not approved" popover only auto-opens for a single, unambiguous rejection.
	const showPopoverOnLoad =
		directories.filter( ( { status } ) => status === 'rejected' ).length === 1;

	const onApplyNowClick = () => {
		recordTracksEvent( 'calypso_partner_directory_dashboard_apply_now_click' );
	};

	const onFinishProfileClick = () => {
		recordTracksEvent( 'calypso_partner_directory_dashboard_finish_profile_click' );
	};

	const onEditExpertiseClick = () => {
		recordTracksEvent( 'calypso_partner_directory_dashboard_edit_expertise_click' );
	};

	const onEditProfileClick = () => {
		recordTracksEvent( 'calypso_partner_directory_dashboard_edit_profile_click' );
	};

	const onPublishProfileClick = () => {
		if ( ! profile || ! application ) {
			return;
		}

		recordTracksEvent( 'calypso_partner_directory_dashboard_publish_profile_click' );

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
			{ directoryStatuses.map( ( { directory, badge } ) => (
				<HStack key={ directory } spacing={ 2 } justify="flex-start" as="span">
					<StatusBadge
						badge={ badge }
						showPopoverOnLoad={ showPopoverOnLoad }
						expertiseUrl={ expertiseUrl }
						recordTracksEvent={ recordTracksEvent }
					/>
					<Text>{ DIRECTORY_NAMES[ directory ] }</Text>
				</HStack>
			) ) }
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
				<ActionList>
					{ directoryStatuses.map( ( { directory, badge } ) => {
						const brandMeta = getBrandMeta( directory, agency );

						return (
							<ActionList.ActionItem
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
											/>
											{ badge.key === 'approved' && ! brandMeta.isAvailable && (
												<Text>{ __( 'This Partner Directory is launching soon.' ) }</Text>
											) }
										</VStack>
									)
								}
								actions={ null }
							/>
						);
					} ) }
				</ActionList>
				<SectionHeader
					level={ 3 }
					title={ __( 'Edit your agency’s information' ) }
					description={ __(
						'Expand to more Automattic directories by adding products or updating your agency’s profile.'
					) }
					actions={
						<>
							<Button variant="secondary" href={ expertiseUrl } onClick={ onEditExpertiseClick }>
								{ __( 'Edit expertise' ) }
							</Button>
							<Button variant="secondary" href={ profileUrl } onClick={ onEditProfileClick }>
								{ __( 'Edit profile' ) }
							</Button>
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
						title={ __( 'Share your expertise' ) }
						description={
							applicationWasSubmitted && directoryStatuses.length > 0
								? directoryStatusBadges
								: __(
										'Pick your agency’s specialties and choose your directories. We’ll review your application.'
								  )
						}
						actions={
							<Button
								variant={ applicationWasSubmitted ? 'secondary' : 'primary' }
								href={ expertiseUrl }
								onClick={ applicationWasSubmitted ? onEditExpertiseClick : onApplyNowClick }
							>
								{ applicationWasSubmitted ? __( 'Edit expertise' ) : __( 'Apply now' ) }
							</Button>
						}
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						title={ __( 'Finish adding details to your public profile' ) }
						description={ __(
							'When approved, add details to your agency’s public profile for clients to see.'
						) }
						actions={
							<Button
								variant={
									applicationWasSubmitted && hasDirectoryApproval && ! isProfileComplete
										? 'primary'
										: 'secondary'
								}
								href={ profileUrl }
								onClick={ onFinishProfileClick }
								disabled={ ! applicationWasSubmitted || ! hasDirectoryApproval }
							>
								{ isProfileComplete ? __( 'Edit profile' ) : __( 'Finish profile' ) }
							</Button>
						}
					/>
				</ActionList>
				<ActionList>
					<ActionList.ActionItem
						title={ __( 'New clients will find you' ) }
						description={
							<VStack spacing={ 1 } as="span">
								<Text>
									{ __(
										'Your agency will appear in the Partner Directories you select and get approved for, including WordPress.com, Woo.com, Pressable.com, and Jetpack.com.'
									) }
								</Text>
								<Text>{ __( 'These Partner Directories are launching soon.' ) }</Text>
							</VStack>
						}
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
