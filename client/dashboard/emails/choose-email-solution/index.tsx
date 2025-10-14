import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ButtonGroup,
	Card,
	CardBody,
	FlexBlock,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useState } from 'react';
import poweredByTitanLogo from '../../../assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import GoogleLogo from '../resources/google-logo';

import './style.scss';

export default function ChooseEmailSolution() {
	const [ billing, setBilling ] = useState( 'annual' as 'monthly' | 'annual' );

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			{ /* Billing selector */ }
			<div className="billing-selector">
				<ButtonGroup>
					<Button
						variant={ billing === 'monthly' ? 'primary' : undefined }
						onClick={ () => setBilling( 'monthly' ) }
					>
						{ billing === 'monthly' ? (
							__( 'Monthly' )
						) : (
							<Text variant="muted">{ __( 'Monthly' ) }</Text>
						) }
					</Button>
					<Button
						variant={ billing === 'annual' ? 'primary' : undefined }
						onClick={ () => setBilling( 'annual' ) }
					>
						{ billing === 'annual' ? (
							__( 'Annually (Save xx%)' )
						) : (
							<Text variant="muted">{ __( 'Annually (Save xx%)' ) }</Text>
						) }
					</Button>
				</ButtonGroup>
			</div>

			{ /* Split card for providers */ }
			<Card className="choose-email-solution__card">
				<CardBody>
					<HStack spacing={ 8 } alignment="stretch" className="choose-email-solution__card-content">
						<FlexBlock>
							<VStack spacing={ 4 }>
								<Icon icon={ wordpress } size={ 33 } className="professional-email-icon" />
								<Text as="h2" size={ 28 }>
									{ __( 'Professional Email' ) }
								</Text>
								<Text>
									{ __(
										'Integrated email solution with powerful features. Manage your email and more on any device.'
									) }
								</Text>
								<VStack spacing={ 2 }>
									<Text size={ 22 } weight={ 600 }>
										{ __( '—' ) }
									</Text>
									<Text variant="muted">{ __( 'per year, per mailbox, excl. taxes.' ) }</Text>
								</VStack>
								<Button className="choose-email-solution__select-mailbox" variant="primary">
									{ __( 'Get professional email' ) }
								</Button>
								<VStack spacing={ 1 }>
									<ul>
										<li>{ __( 'Send and receive from your custom domain' ) }</li>
										<li>{ __( '30GB storage' ) }</li>
										<li>{ __( 'Email, calendar, and contacts' ) }</li>
										<li>{ __( '24/7 support via email' ) }</li>
									</ul>
								</VStack>
								<img
									className="titan-logo"
									src={ poweredByTitanLogo }
									alt={ __( 'Powered by Titan' ) }
								/>
							</VStack>
						</FlexBlock>
						<div
							className="choose-email-solution__divider"
							role="separator"
							aria-orientation="vertical"
							aria-hidden="true"
						/>
						<FlexBlock>
							<VStack spacing={ 4 }>
								<GoogleLogo
									size={ 28 }
									className="choose-email-solution__provider-logo"
									aria-label={ __( 'Google Workspace logo' ) }
								/>
								<Text as="h2" size={ 28 }>
									{ __( 'Google Workspace' ) }
								</Text>
								<Text>
									{ __(
										'Integrated email solution with powerful features. Manage your email and more on any device.'
									) }
								</Text>
								<VStack spacing={ 2 }>
									<Text size={ 22 } weight={ 600 }>
										{ __( '—' ) }
									</Text>
									<Text variant="muted">{ __( 'per year, per mailbox, excl. taxes.' ) }</Text>
								</VStack>
								<Button className="choose-email-solution__select-mailbox" variant="primary">
									{ __( 'Get Google Workspace' ) }
								</Button>
								<VStack spacing={ 1 }>
									<ul>
										<li>{ __( 'Send and receive from your custom domain' ) }</li>
										<li>{ __( '30GB storage' ) }</li>
										<li>{ __( 'Email, calendar, and contacts' ) }</li>
										<li>{ __( 'Video calls, docs, spreadsheets, and more' ) }</li>
										<li>{ __( 'Real-time collaboration' ) }</li>
										<li>{ __( 'Store and share files in the cloud' ) }</li>
										<li>{ __( '24/7 support via email' ) }</li>
									</ul>
								</VStack>
							</VStack>
						</FlexBlock>
					</HStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
