import { HostingFeatures } from '@automattic/api-core';
import { bigSkyPluginMutation, bigSkyPluginQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { brush, check, comment, help, image, termDescription } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody, CardFooter } from '../../components/card';
import ConfirmModal from '../../components/confirm-modal';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import SummaryButton from '../../components/summary-button';
import { SummaryButtonList } from '../../components/summary-button-list';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import upsellIllustrationUrl from './upsell-illustration.svg';

const features = [
	__( 'Get answers where you work so you‘re unstuck faster' ),
	__( 'Update your site design with less effort' ),
	__( 'Draft and revise content in one place' ),
	__( 'Create beautiful images without leaving WordPress' ),
];

export default function AIToolsSettings( { siteSlug }: { siteSlug: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: pluginStatus } = useSuspenseQuery( bigSkyPluginQuery( site.ID ) );

	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState( false );

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: ! isEnabled ? __( 'AI assistant enabled.' ) : __( 'AI assistant disabled.' ),
				error: __( 'Failed to save AI assistant settings.' ),
			},
		},
	} );

	const description = isAvailable
		? createInterpolateElement(
				__(
					'Create content, transform designs, generate images, and get instant help with AI. <learnMoreLink />'
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="ai-tools" />,
				}
		  )
		: undefined;

	const handleToggle = ( enable: boolean ) => {
		if ( enable ) {
			recordTracksEvent( 'calypso_dashboard_ai_tool_ai_assistant_enabled' );
		} else {
			recordTracksEvent( 'calypso_dashboard_ai_tool_ai_assistant_disabled' );
		}

		mutation.mutate(
			{ enable },
			{
				onSuccess: () => {
					setIsConfirmModalOpen( false );
				},
			}
		);
	};

	const renderContent = () => {
		if ( ! isAvailable ) {
			return (
				<UpsellCallout
					site={ site }
					feature={ HostingFeatures.BIG_SKY }
					upsellId="ai-tools"
					upsellTitle={ __( 'Your dream site is just a prompt away' ) }
					upsellDescription={ __(
						'Get AI-powered assistance to help you build, edit, and redesign your site with ease.'
					) }
					upsellIcon={ comment }
					upsellImage={ upsellIllustrationUrl }
				/>
			);
		}

		return (
			<>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								title={ __( 'AI assistant' ) }
								description={ __( 'Helps with site setup, content, design, and more.' ) }
								level={ 3 }
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ isEnabled }
								disabled={ mutation.isPending }
								label={ __( 'Enable AI assistant' ) }
								onChange={ handleToggle }
							/>
						</VStack>
					</CardBody>
					{ ! isEnabled && (
						<CardFooter style={ { background: '#FAFAFA' } }>
							<VStack as="ul" spacing={ 1 } style={ { padding: 0, margin: 0 } }>
								{ features.map( ( feature, i ) => (
									<HStack key={ i } as="li" justify="flex-start" spacing={ 3 }>
										<Icon
											icon={ check }
											fill="var(--dashboard__foreground-color-success"
											style={ { flexShrink: 0, alignSelf: 'flex-start' } }
										/>
										<Text>{ feature }</Text>
									</HStack>
								) ) }
							</VStack>
						</CardFooter>
					) }
				</Card>
				{ isFreeTrial && (
					<ConfirmModal
						isOpen={ isConfirmModalOpen }
						onCancel={ () => setIsConfirmModalOpen( false ) }
						onConfirm={ () => handleToggle( false ) }
						confirmButtonProps={ {
							label: __( 'Disable AI assistant' ),
							isBusy: mutation.isPending,
							disabled: mutation.isPending,
						} }
					>
						{ __(
							'You are on a free trial. If you disable AI assistant, you will not be able to turn it back on without a paid plan.'
						) }
					</ConfirmModal>
				) }
				{ isEnabled && (
					<VStack spacing={ 3 }>
						<SectionHeader title={ __( 'Ways to get started' ) } level={ 3 } />
						<SummaryButtonList>
							<SummaryButton
								title={ __( 'Get answers' ) }
								decoration={ <Icon icon={ help } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_get_answers_click' );
									setNavigateToRoute( '/odie' );
									setShowHelpCenter( true );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }site-editor.php?canvas=edit` }
								title={ __( 'Update your site design' ) }
								decoration={ <Icon icon={ brush } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_edit_site_click' );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }post-new.php` }
								title={ __( 'Draft and revise content' ) }
								decoration={ <Icon icon={ termDescription } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_draft_post_click' );
								} }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }upload.php?ai-assistant` }
								title={ __( 'Create beautiful images' ) }
								decoration={ <Icon icon={ image } /> }
								onClick={ () => {
									recordTracksEvent( 'calypso_dashboard_ai_tool_create_images_click' );
								} }
							/>
						</SummaryButtonList>
					</VStack>
				) }
			</>
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI tools' ) }
					description={ description }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
