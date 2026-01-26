import { bigSkyPluginMutation, bigSkyPluginQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, comment } from '@wordpress/icons';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { Card, CardBody, CardFooter } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import upsellIllustrationUrl from './upsell-illustration.svg';
import type { Field } from '@wordpress/dataviews';

type AIToolsFormData = {
	enable: boolean;
};

const fields: Field< { ai_assistant: boolean } >[] = [
	{
		id: 'ai_assistant',
		type: 'boolean',
		label: __( 'Enable AI assistant' ),
		Edit: 'toggle',
	},
];

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'ai_assistant' ],
};

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
	// const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const [ formData, setFormData ] = useState< AIToolsFormData >( {
		enable: isEnabled,
	} );

	const mutation = useMutation( {
		...bigSkyPluginMutation( site.ID ),
		meta: {
			snackbar: {
				success: formData.enable ? __( 'AI tools enabled.' ) : __( 'AI tools disabled' ),
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

	const handleSubmit = () => {
		mutation.mutate( formData );
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
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<SectionHeader
								title={ __( 'AI assistant' ) }
								description={ __( 'Helps with site setup, content, design, and more.' ) }
								level={ 3 }
							/>
							<DataForm< AIToolsFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: { enable?: boolean } ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
						</VStack>
					</form>
				</CardBody>
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
			</Card>
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
