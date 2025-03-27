import { WPCOM_FEATURES_BACKUPS, WPComPlan } from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import { AtomicRevertStep } from 'calypso/components/marketing-survey/cancel-purchase-form/step-components/atomic-revert-step';
import { Purchase } from 'calypso/lib/purchases/types';
import { fetchAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { CalypsoDispatch } from 'calypso/state/types';

interface AtomicWarningProps {
	purchaseRoot: string;
	currentPlan: WPComPlan;
	purchase: Purchase;
	site: any;
	closeDialog: () => void;
	handleDowngrade: ( enableLosslessRevert: boolean ) => void;
	targetPlanName: TranslateResult;
	isDowngrading: boolean;
	siteSlug: string;
}

export function AtomicWarning( {
	purchase,
	site,
	closeDialog,
	handleDowngrade,
	targetPlanName,
	isDowngrading,
	siteSlug,
}: AtomicWarningProps ) {
	const [ atomicRevertCheckOne, setAtomicRevertCheckOne ] = useState( false );
	const [ atomicRevertCheckTwo, setAtomicRevertCheckTwo ] = useState( false );
	const [ enableLosslessRevert, setEnableLosslessRevert ] = useState( true );
	const hasBackupsFeature = useSelector( ( state ) =>
		siteHasFeature( state, site.ID, WPCOM_FEATURES_BACKUPS )
	);
	const dispatch = useDispatch< CalypsoDispatch >();

	useEffect( () => {
		if ( purchase?.siteId ) {
			dispatch( fetchAtomicTransfer( purchase.siteId ) );
		}
	}, [ dispatch, purchase?.siteId ] );

	const atomicTransfer = useSelector( ( state ) => getAtomicTransfer( state, purchase?.siteId ) );

	const translate = useTranslate();
	return (
		<div className="atomic-warning__wrapper">
			<BlankCanvas className="atomic-warning">
				<BlankCanvas.Header onBackClick={ closeDialog }>
					{ siteSlug && (
						<span className="cancel-purchase-form__site-slug">Downgrade plan: { siteSlug }</span>
					) }
				</BlankCanvas.Header>
				<BlankCanvas.Content>
					<AtomicRevertStep
						action="downgrade-plan"
						atomicTransfer={ atomicTransfer }
						purchase={ purchase }
						site={ site }
						isDowngradePlan
						atomicRevertCheckOne={ atomicRevertCheckOne }
						onClickCheckOne={ () => setAtomicRevertCheckOne( ! atomicRevertCheckOne ) }
						atomicRevertCheckTwo={ atomicRevertCheckTwo }
						onClickCheckTwo={ () => setAtomicRevertCheckTwo( ! atomicRevertCheckTwo ) }
						hasBackupsFeature={ hasBackupsFeature }
						enableLosslessRevert={ enableLosslessRevert }
						setEnableLosslessRevert={ setEnableLosslessRevert }
					/>
				</BlankCanvas.Content>
				<BlankCanvas.Footer>
					<Button
						isBusy={ isDowngrading }
						variant="primary"
						onClick={ () => handleDowngrade( enableLosslessRevert ) }
						disabled={ ! atomicRevertCheckOne || ! atomicRevertCheckTwo }
					>
						{ translate( 'Downgrade to %(targetPlan)s', {
							args: { targetPlan: targetPlanName },
						} ) }
					</Button>
				</BlankCanvas.Footer>
			</BlankCanvas>
		</div>
	);
}
