import {
	getFeatureDifference,
	getFeatureByKey,
	getPlan,
	getPlanPath,
	type PlanSlug,
} from '@automattic/calypso-products';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Icon,
} from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';

import './style.scss';

interface DowngradeConfirmationModalProps {
	isOpen: boolean;
	currentPlanSlug: PlanSlug;
	targetPlanSlug: PlanSlug | null;
	siteId: number | null | undefined;
	redirectTo?: string;
	onClose: () => void;
}

const DowngradeConfirmationModal = ( {
	isOpen,
	currentPlanSlug,
	targetPlanSlug,
	siteId,
	redirectTo,
	onClose,
}: DowngradeConfirmationModalProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const lostFeatures = useMemo( () => {
		if ( ! targetPlanSlug ) {
			return [];
		}
		const featureSlugs = getFeatureDifference(
			targetPlanSlug,
			currentPlanSlug,
			'getCancellationFeatures'
		);
		return featureSlugs
			.map( ( slug ) => getFeatureByKey( slug ) )
			.filter( ( feature ): feature is NonNullable< typeof feature > => !! feature );
	}, [ targetPlanSlug, currentPlanSlug ] );

	if ( ! targetPlanSlug || ! isOpen ) {
		return null;
	}

	const currentPlanTitle = getPlan( currentPlanSlug )?.getTitle() ?? '';
	const targetPlanTitle = getPlan( targetPlanSlug )?.getTitle() ?? '';

	const handleConfirm = () => {
		const planPath = getPlanPath( targetPlanSlug );
		if ( ! planPath || ! siteSlug ) {
			return;
		}
		const checkoutUrl = `/checkout/${ encodeURIComponent( siteSlug ) }/${ planPath }`;
		const cancelTo = window.location.href.replace( window.location.origin, '' );
		const finalUrl = addQueryArgs(
			{
				...( redirectTo && { redirect_to: redirectTo } ),
				cancel_to: cancelTo,
				expired_downgrade: 'true',
			},
			checkoutUrl
		);
		window.location.assign( finalUrl );
	};

	return (
		<Modal
			title={ String(
				translate( 'Confirm your plan change', {
					comment: 'Title of the confirmation modal when downgrading an expired plan',
				} )
			) }
			onRequestClose={ onClose }
			className="downgrade-confirmation-modal"
		>
			<VStack spacing={ 4 }>
				{ lostFeatures.length > 0 ? (
					<>
						<p>
							{ translate(
								"You're changing from %(currentPlan)s to %(targetPlan)s. You'll lose access to these features:",
								{
									args: {
										currentPlan: currentPlanTitle,
										targetPlan: targetPlanTitle,
									},
									comment:
										'Message shown when downgrading an expired plan, listing features that will be lost',
								}
							) }
						</p>
						<VStack as="ul" spacing={ 1 } className="downgrade-confirmation-modal__feature-list">
							{ lostFeatures.map( ( feature ) => (
								<HStack as="li" key={ feature.getSlug() } spacing={ 2 } justify="flex-start">
									<Icon
										icon={ close }
										size={ 24 }
										className="downgrade-confirmation-modal__feature-icon"
									/>
									<span>{ feature.getTitle() }</span>
								</HStack>
							) ) }
						</VStack>
					</>
				) : (
					<p>
						{ translate( "You're changing from %(currentPlan)s to %(targetPlan)s.", {
							args: {
								currentPlan: currentPlanTitle,
								targetPlan: targetPlanTitle,
							},
							comment: 'Message shown when downgrading an expired plan with no feature differences',
						} ) }
					</p>
				) }
				<HStack spacing={ 3 } justify="flex-start">
					<Button __next40pxDefaultSize variant="primary" onClick={ handleConfirm }>
						{ translate( 'Downgrade to %(planName)s', {
							args: { planName: targetPlanTitle },
							comment: 'Button label to confirm downgrading to a lower-tier plan',
						} ) }
					</Button>
					<Button __next40pxDefaultSize variant="secondary" onClick={ onClose }>
						{ translate( 'Keep %(planName)s', {
							args: { planName: currentPlanTitle },
							comment: 'Button label to dismiss the downgrade modal and keep the current plan',
						} ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
