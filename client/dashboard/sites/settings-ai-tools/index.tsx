import { bigSkyPluginMutation, bigSkyPluginQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Icon,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { brush, check, comment, help, image, termDescription } from '@wordpress/icons';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ActionList } from '../../components/action-list';
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
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: pluginStatus } = useSuspenseQuery( bigSkyPluginQuery( site.ID ) );

	const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const [ isConfirmModalOpen, setIsConfirmModalOpen ] = useState( false );

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: ! isEnabled ? __( 'AI tools enabled.' ) : __( 'AI tools disabled.' ),
				error: __( 'Failed to save AI tools settings.' ),
			},
		},
	} );

	const description = isAvailable
		? createInterpolateElement(
				__(
					'Create content, transform designs, generate images, and get instant help with AI. <learnMoreLink />'
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="hosting-mysql" />,
				}
		  )
		: undefined;

	const handleToggle = ( enable: boolean ) => {
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
								onChange={ ( checked: boolean ) => handleToggle( checked ) }
							/>
						</VStack>
					</CardBody>
					{ ! isEnabled && (
						<CardFooter style={ { background: '#FAFAFA' } }>
							<ul style={ { padding: 0, margin: 0 } }>
								{ features.map( ( feature, i ) => (
									<HStack key={ i } as="li" justify="flex-start" spacing={ 3 }>
										<Icon icon={ check } fill="var(--dashboard__foreground-color-success" />
										<Text>{ feature }</Text>
									</HStack>
								) ) }
							</ul>
						</CardFooter>
					) }
				</Card>
				{ isFreeTrial && (
					<ConfirmModal
						isOpen={ isConfirmModalOpen }
						onCancel={ () => setIsConfirmModalOpen( false ) }
						onConfirm={ () => handleToggle( false ) }
						confirmButtonProps={ {
							label: __( 'Disable AI tools' ),
							isBusy: mutation.isPending,
							disabled: mutation.isPending,
						} }
					>
						{ __(
							'You are on a free trial. If you disable AI tools, you will not be able to turn it back on without a paid plan.'
						) }
					</ConfirmModal>
				) }
				{ isEnabled && (
					<ActionList>
						<ActionList.ActionItem
							title={ __( 'Content guidelines' ) }
							description={ __( 'Share details about your site to improve AI responses.' ) }
							actions={
								<Button
									variant="secondary"
									size="compact"
									// TODO: Open the content guidelines page
									onClick={ () => window.open( site.options?.admin_url, '_blank' ) }
								>
									{ __( 'Update' ) }
								</Button>
							}
						/>
					</ActionList>
				) }
				{ isEnabled && (
					<VStack spacing={ 3 }>
						<SectionHeader title={ __( 'Ways to get started' ) } level={ 3 } />
						<SummaryButtonList>
							<SummaryButton
								// TODO: Open the assistant
								href={ `${ site.options?.admin_url }edit.php?post_type=post` }
								title={ __( 'Get answers' ) }
								decoration={ <Icon icon={ help } /> }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }site-editor.php?canvas=edit'` }
								title={ __( 'Update your site design' ) }
								decoration={ <Icon icon={ brush } /> }
							/>
							<SummaryButton
								href={ `${ site.options?.admin_url }edit.php?post_type=post` }
								title={ __( 'Draft and revise content' ) }
								decoration={ <Icon icon={ termDescription } /> }
							/>
							<SummaryButton
								// TODO: Point to Image Studio
								href={ `${ site.options?.admin_url }upload.php` }
								title={ __( 'Create beautiful images' ) }
								decoration={ <Icon icon={ image } /> }
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
