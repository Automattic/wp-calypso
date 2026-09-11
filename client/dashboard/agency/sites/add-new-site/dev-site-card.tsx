import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Tooltip,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { Card, CardBody } from '../../../components/card';

const FREE_DEV_SITE_ALLOWANCE = 5;

interface DevSiteCardProps {
	availableDevSites: number;
	isAgencyApproved: boolean;
	onClick: () => void;
}

export default function DevSiteCard( {
	availableDevSites,
	isAgencyApproved,
	onClick,
}: DevSiteCardProps ) {
	const cta = (
		<Button
			variant="link"
			size="compact"
			disabled={ availableDevSites === 0 || ! isAgencyApproved }
			// Keeps the button focusable while disabled, so the tooltip below
			// explaining why is reachable by keyboard.
			accessibleWhenDisabled
			onClick={ onClick }
			__next40pxDefaultSize
		>
			{ __( 'Create a site now' ) }
		</Button>
	);

	return (
		<Card isBorderless variant="secondary" className="dashboard-agency-add-new-site__dev-site-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<img src={ devSiteBanner } alt="" aria-hidden="true" />
					<VStack spacing={ 1 }>
						<Text size="title">{ __( 'Start building for free' ) }</Text>
						<Text variant="muted" as="p">
							{ __(
								'Develop WordPress.com sites for as long as you need, with free development sites. Only pay when you launch!'
							) }
						</Text>
					</VStack>
					<VStack spacing={ 1 } alignment="left">
						<Text variant="muted">
							{ sprintf(
								/* translators: %1$d is the number of free licenses left, %2$d the total allowance. */
								__( '%1$d of %2$d free licenses available' ),
								availableDevSites,
								FREE_DEV_SITE_ALLOWANCE
							) }
						</Text>
						{ isAgencyApproved ? (
							cta
						) : (
							<Tooltip
								text={ __(
									'Your agency is not yet approved. Please wait for approval before creating a development site.'
								) }
							>
								{ cta }
							</Tooltip>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
