import { recordTracksEvent } from '@automattic/calypso-analytics';
import { OnboardSelect } from '@automattic/data-stores';
import { useSelect, useDispatch as useWpDataDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSelector, useDispatch } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { usePastBillingTransactions } from 'calypso/state/sites/hooks/use-billing-history';
import { CompleteDomainsTransferred } from './complete-domains-transferred';
import type { Step } from '../../types';
import './styles.scss';

const Complete: Step = function Complete( { flow } ) {
	const { __, _n } = useI18n();
	const dispatch = useDispatch();
	const { billingTransactions, isLoading: isLoadingTransactions } = usePastBillingTransactions();

	// Use the stored domains as a clue for the number of domains that were transferred to render placeholders.
	// This number is used as a rough guess, and shouldn't be used to render anything.
	const storedDomainsState = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getBulkDomainsData(),
		[]
	);
	const storedDomainsAmount = Object.keys( { ...storedDomainsState } ).length;
	const { resetOnboardStore } = useWpDataDispatch( ONBOARD_STORE );

	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const userPurchases = useSelector( ( state ) => getUserPurchases( state ) );
	const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

	const newlyTransferredDomains = userPurchases?.filter(
		( purchase ) =>
			purchase.productSlug === 'domain_transfer' &&
			Date.now() - new Date( purchase.subscribedDate ).getTime() < oneDay
	);

	const newlyTransferredDomainsTransactions = billingTransactions?.filter(
		( transaction ) => Date.now() - new Date( transaction.date ).getTime() < oneDay
	);

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	useEffect( () => {
		dispatch( fetchUserPurchases( userId ) );
	}, [] );

	useEffect( () => {
		if ( ! isLoadingTransactions && newlyTransferredDomains?.length ) {
			newlyTransferredDomainsTransactions?.forEach( ( transaction ) => {
				const { id } = transaction;

				transaction.items
					?.filter( ( item ) => item.wpcom_product_slug === 'domain_transfer' )
					.forEach( ( item ) => {
						const { amount_integer, wpcom_product_slug, variation } = item;

						const productId = newlyTransferredDomains?.find(
							( purchase ) => purchase.productSlug === wpcom_product_slug
						)?.productId;

						recordTracksEvent( 'wpcom_product_purchase', {
							cost: amount_integer,
							free_trial: false,
							product_category: 'Domain',
							product_id: productId,
							product_name: variation,
							product_slug: wpcom_product_slug,
							receipt_id: id,
							receipt_item_id: item.id,
						} );
					} );
			} );
		}
	}, [ newlyTransferredDomainsTransactions, isLoadingTransactions, newlyTransferredDomains ] );

	const clearDomainsStore = () => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination: '/setup/domain-transfer',
		} );
		resetOnboardStore();
	};

	return (
		<>
			<StepContainer
				flowName={ flow }
				stepName="complete"
				isHorizontalLayout={ false }
				isLargeSkipLayout={ false }
				formattedHeader={
					<FormattedHeader
						id="domains-header"
						headerText={ _n(
							'Your domain transfer has started',
							'Your domain transfers have started',
							newlyTransferredDomains?.length || storedDomainsAmount
						) }
						subHeaderText={
							<>
								<span>
									{ _n(
										"We've got it from here! We'll let you know when your newly transferred domain is ready to use!",
										"We've got it from here! We'll let you know when your newly transferred domains are ready to use!",
										newlyTransferredDomains?.length || storedDomainsAmount
									) }
								</span>
								<span className="formatted-header-subtitle__bold">
									{ __( 'Domain transfers may take up to 5-10 days.' ) }
								</span>
							</>
						}
						align="center"
						children={
							<div className="domain-header-buttons">
								<a
									href="/setup/domain-transfer"
									onClick={ clearDomainsStore }
									className="components-button is-secondary"
								>
									{ __( 'Transfer more domains' ) }
								</a>

								<a
									href="/domains/manage?filter=owned-by-me&sortKey=registered-until"
									className="components-button is-primary manage-all-domains"
									onClick={ () => handleUserClick( '/domains/manage' ) }
								>
									{ __( 'Manage all domains' ) }
								</a>
							</div>
						}
					/>
				}
				stepContent={
					<CompleteDomainsTransferred
						placeHolderCount={ storedDomainsAmount }
						newlyTransferredDomains={ newlyTransferredDomains }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
				showHeaderJetpackPowered={ false }
				showHeaderWooCommercePowered={ false }
				showVideoPressPowered={ false }
				showJetpackPowered={ false }
				hideBack={ true }
			/>
		</>
	);
};

export default Complete;
