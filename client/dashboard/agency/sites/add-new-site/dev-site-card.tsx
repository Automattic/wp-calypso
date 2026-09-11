import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Tooltip,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { Card, CardBody } from '../../../components/card';
import { TextBlur } from '../../../components/text-blur';

const FREE_DEV_SITE_ALLOWANCE = 5;

interface DevSiteCardProps {
	/** Undefined until the license query settles, and if it failed. */
	availableDevSites: number | undefined;
	isAgencyApproved: boolean;
	onClick: () => void;
}

export default function DevSiteCard( {
	availableDevSites,
	isAgencyApproved,
	onClick,
}: DevSiteCardProps ) {
	const isCountKnown = availableDevSites !== undefined;

	// An unknown count blocks the CTA the same way an exhausted one does, but
	// there is nothing to explain yet, so it gets no tooltip.
	const blockedReason = ! isAgencyApproved
		? __(
				'Your agency is not yet approved. Please wait for approval before creating a development site.'
		  )
		: undefined;

	return (
		<Card isBorderless variant="secondary" className="dashboard-agency-add-new-site__dev-site-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<img src={ devSiteBanner } alt="" />
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
							<TextBlur isBlurred={ ! isCountKnown } length={ 30 }>
								{ sprintf(
									/* translators: %1$d is the number of free licenses left, %2$d the total allowance. */
									__( '%1$d of %2$d free licenses available' ),
									availableDevSites ?? 0,
									FREE_DEV_SITE_ALLOWANCE
								) }
							</TextBlur>
						</Text>
						<Tooltip text={ blockedReason }>
							<Button
								variant="link"
								size="compact"
								disabled={ ! availableDevSites || !! blockedReason }
								// Keeps the button focusable while disabled, so the tooltip
								// explaining why is reachable by keyboard.
								accessibleWhenDisabled
								onClick={ onClick }
								__next40pxDefaultSize
							>
								{ __( 'Create a site now' ) }
							</Button>
						</Tooltip>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
