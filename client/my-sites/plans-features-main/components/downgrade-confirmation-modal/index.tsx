import {
	getFeatureDifference,
	getFeatureByKey,
	getPlan,
	getPlanPath,
	type PlanSlug,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
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
			'getDowngradeFeatures'
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
			title={ String( translate( 'Confirm downgrade' ) ) }
			onRequestClose={ onClose }
			className="downgrade-confirmation-modal"
			size="medium"
		>
			{ lostFeatures.length > 0 ? (
				<>
					<p className="downgrade-confirmation-modal__description">
						{ translate(
							"When you change from %(currentPlan)s to %(targetPlan)s, here's what you'll lose:",
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
					<ul className="downgrade-confirmation-modal__feature-list">
						{ lostFeatures.map( ( feature ) => (
							<li key={ feature.getSlug() } className="downgrade-confirmation-modal__feature-item">
								<Gridicon
									icon="cross-small"
									size={ 24 }
									className="downgrade-confirmation-modal__feature-icon"
								/>
								<span className="downgrade-confirmation-modal__feature-text">
									{ feature.getTitle() }
								</span>
							</li>
						) ) }
					</ul>
				</>
			) : (
				<p className="downgrade-confirmation-modal__description">
					{ translate(
						'When you change from %(currentPlan)s to %(targetPlan)s, your features will stay the same.',
						{
							args: {
								currentPlan: currentPlanTitle,
								targetPlan: targetPlanTitle,
							},
							comment: 'Message shown when downgrading an expired plan with no feature differences',
						}
					) }
				</p>
			) }
			<HStack spacing={ 3 } justify="flex-end" className="downgrade-confirmation-modal__buttons">
				<Button __next40pxDefaultSize variant="tertiary" onClick={ onClose }>
					{ translate( 'Keep %(planName)s', {
						args: { planName: currentPlanTitle },
						comment: 'Button label to dismiss the downgrade modal and keep the current plan',
					} ) }
				</Button>
				<Button __next40pxDefaultSize variant="primary" onClick={ handleConfirm }>
					{ translate( 'Downgrade to %(planName)s', {
						args: { planName: targetPlanTitle },
						comment: 'Button label to confirm downgrading to a lower-tier plan',
					} ) }
				</Button>
			</HStack>
		</Modal>
	);
};

export default DowngradeConfirmationModal;
