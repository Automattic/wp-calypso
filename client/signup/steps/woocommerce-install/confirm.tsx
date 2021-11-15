import { CompactCard } from '@automattic/components';
import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { default as HoldList } from 'calypso/blocks/eligibility-warnings/hold-list';
import WarningList from 'calypso/blocks/eligibility-warnings/warning-list';
import {
	fetchAutomatedTransferStatusOnce,
	requestEligibility,
} from 'calypso/state/automated-transfer/actions';
import {
	isFetchingAutomatedTransferStatus,
	getEligibility,
	EligibilityData,
} from 'calypso/state/automated-transfer/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { GoToStep } from '../../types';

interface Props {
	goToStep: GoToStep;
}

export default function Confirm( { goToStep }: Props ): ReactElement | null {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const [ loading, setLoading ] = useState( true );

	const dispatch = useDispatch();
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( fetchAutomatedTransferStatusOnce( siteId ) );
		dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	const fetchingTransferStatus = !! useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);

	useEffect( () => {
		if ( fetchingTransferStatus ) {
			setLoading( true );
			return;
		}
		setLoading( false );
	}, [ fetchingTransferStatus ] );

	const {
		eligibilityHolds,
		eligibilityWarnings: allEligibilityWarnings,
	}: EligibilityData = useSelector( ( state ) => getEligibility( state, siteId ) );

	/*
	 * Clean wpcom subdomain from eligibility warnings array.
	 * It's handled in the `woocommerce-install-confirm-wordpress-subdomain` step.
	 */
	const eligibilityWarnings = allEligibilityWarnings?.filter(
		( { id } ) => id !== 'wordpress_subdomain'
	);

	return (
		<>
			<div className="woocommerce-install__heading-wrapper">
				<div className="woocommerce-install__heading">
					<Title>{ __( 'Add WooCommerce to your site' ) }</Title>
					<SubTitle></SubTitle>

					<div className="woocommerce-install__buttons-group">
						<div>
							<BackButton onClick={ () => goToStep( 'confirm' ) } />
						</div>
					</div>
				</div>
			</div>
			<div className="woocommerce-install__content">
				{ loading && <Spinner /> }
				{ !! eligibilityHolds?.length && (
					<CompactCard>
						<HoldList holds={ eligibilityHolds } context={ 'plugins' } isPlaceholder={ false } />
					</CompactCard>
				) }
				{ !! eligibilityWarnings?.length && (
					<CompactCard>
						<WarningList warnings={ eligibilityWarnings } context={ 'plugins' } />
					</CompactCard>
				) }
				<div>
					<NextButton onClick={ () => goToStep( 'transfer' ) }>{ __( 'Confirm' ) }</NextButton>
				</div>
			</div>
		</>
	);
}
