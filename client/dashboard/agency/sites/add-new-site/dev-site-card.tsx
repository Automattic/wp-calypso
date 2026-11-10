import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import devSiteBanner from 'calypso/assets/images/a8c-for-agencies/dev-site-banner.svg';
import { Card, CardBody } from '../../../components/card';
import { TextBlur } from '../../../components/text-blur';
import { ApprovalGate, useIsApprovalGated } from '../../approval-gate';

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
	const isGated = useIsApprovalGated();
	const [ isGateOpen, setIsGateOpen ] = useState( false );

	return (
		<Card isBorderless variant="secondary">
			{ isGateOpen && <ApprovalGate kind="dev-site" onClose={ () => setIsGateOpen( false ) } /> }
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
							<TextBlur isBlurred={ ! isCountKnown } length={ 20 }>
								{ sprintf(
									/* translators: %1$d is the number of free licenses left, %2$d the total allowance. */
									__( '%1$d of %2$d free licenses available' ),
									availableDevSites ?? 0,
									FREE_DEV_SITE_ALLOWANCE
								) }
							</TextBlur>
						</Text>
						<Button
							variant="link"
							size="compact"
							disabled={ ! isGated && ( ! availableDevSites || ! isAgencyApproved ) }
							accessibleWhenDisabled
							onClick={ isGated ? () => setIsGateOpen( true ) : onClick }
							__next40pxDefaultSize
						>
							{ __( 'Create a site now' ) }
						</Button>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
