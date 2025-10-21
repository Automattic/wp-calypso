import { Badge } from '@automattic/ui';
import {
	Button,
	Card,
	CardBody,
	ExternalLink,
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { layout, swatch } from '@wordpress/icons';
import './domain-connection-verification.scss';
import { useHelpCenter } from '../../app/help-center';
import { siteOverviewRoute } from '../../app/router/sites';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

interface DomainConnectionNextStep {
	id: string;
	title: string;
	description: string;
	gridicon: string;
}

interface DomainConnectionVerificationProps {
	domainName: string;
	siteSlug: string;
}

export default function DomainConnectionVerification( {
	domainName,
	siteSlug,
}: DomainConnectionVerificationProps ) {
	const { setShowHelpCenter } = useHelpCenter();
	const data: DomainConnectionNextStep[] = [
		{
			id: 'automatic-verification',
			title: __( 'Automatic verification' ),
			description: __( 'We’ll check your DNS records and verify your domain connection.' ),
			gridicon: 'rotateRight',
		},
		{
			id: 'global-propagation',
			title: __( 'Global propagation' ),
			description: __(
				'Once name servers are verified, your domain name will gradually become live globally.'
			),
			gridicon: 'globe',
		},
		{
			id: 'cache-propagation',
			title: __( 'We’ll notify you when it’s ready' ),
			description: __( 'No need to refresh this page. We’ll email you as soon as it’s done.' ),
			gridicon: 'published',
		},
	];

	const fields: Field< DomainConnectionNextStep >[] = [
		{
			id: 'gridicon',
			render: ( { item } ) => (
				<Icon
					icon={ gridiconToWordPressIcon( item.gridicon ) }
					size={ 32 }
					className="dashboard-domain-connection-verification__icon"
				/>
			),
		},
		{
			id: 'title',
			getValue: ( { item } ) => item.title,
		},
		{
			id: 'description',
			getValue: ( { item } ) => item.description,
		},
	];

	const view = {
		fields: [ 'description' ],
		type: 'list' as const,
		titleField: 'title',
		mediaField: 'gridicon',
		showMedia: true,
		groupByField: 'type',
	};

	return (
		<Card className="dashboard-domain-connection-verification">
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack justify="flex-start">
						<Icon icon={ swatch } />
						<Text className="domain-connection-verification-title" size={ 10 }>
							{ domainName }
						</Text>
						<Badge intent="warning">Verifying</Badge>
					</HStack>
					<Notice variant="info">
						{ __(
							'We’re checking your DNS records. Most updates happen quickly, but some providers cache old settings for up to 72 hours.'
						) }
					</Notice>
					<Text size="medium" weight={ 500 }>
						{ __( 'While you wait' ) }
					</Text>
					<RouterLinkSummaryButton
						to={ siteOverviewRoute.fullPath }
						params={ { siteSlug } }
						title={ __( 'Customize your site' ) }
						description={ __(
							'While your domain name is connecting, you can still work on your site.'
						) }
						decoration={ <Icon icon={ layout } /> }
					/>
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<Text size="medium" weight={ 500 }>
									{ __( 'What happens next' ) }
								</Text>
								<DataViews< DomainConnectionNextStep >
									data={ data }
									fields={ fields }
									view={ view }
									onChangeView={ () => {} }
									getItemId={ ( item ) => item.id }
									paginationInfo={ { totalItems: data.length, totalPages: 1 } }
									defaultLayouts={ { list: {} } }
								>
									<DataViews.Layout />
								</DataViews>
							</VStack>
						</CardBody>
					</Card>
					<Text size="medium" weight={ 500 }>
						{ __( 'Need help?' ) }
					</Text>
					<VStack spacing={ 2 }>
						<InlineSupportLink supportContext="map-domain-setup-instructions">
							{ __( 'Domain connection guide' ) }
						</InlineSupportLink>
						<ExternalLink href="https://godaddy.com" children={ __( 'Registrar instructions' ) } />
						<Button
							variant="link"
							onClick={ () => setShowHelpCenter( true ) }
							children={ __( 'Contact support' ) }
						/>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
