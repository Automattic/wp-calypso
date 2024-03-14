import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { serializeQueryStringProducts } from 'calypso/jetpack-cloud/sections/partner-portal/lib/querystring-products';
import { containEquivalentItems } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/hooks/use-submit-form';
import { a4aPurchasesBasePath } from 'calypso/lib/a8c-for-agencies/paths';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { APIError } from 'calypso/state/partner-portal/types';
import useIssueAndAssignLicenses from '../../hooks/use-issue-and-assign-licenses';
import { IssueLicenseRequest } from '../../hooks/use-issue-licenses';
import type { SiteDetails } from '@automattic/data-stores';

const useSubmitForm = ( selectedSite?: SiteDetails | null, suggestedProductSlugs?: string[] ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { issueAndAssignLicenses, isReady: isIssueAndAssignLicensesReady } =
		useIssueAndAssignLicenses( selectedSite, {
			onIssueError: ( error: APIError ) => {
				if ( error.code === 'missing_valid_payment_method' ) {
					dispatch(
						errorNotice(
							translate(
								'A primary payment method is required.{{br/}} {{a}}Try adding a new payment method{{/a}} or contact support.',
								{
									components: {
										a: (
											<a
												href={ a4aPurchasesBasePath( '/payment-methods/add?return=/marketplace' ) }
											/>
										),
										br: <br />,
									},
								}
							)
						)
					);

					return;
				}

				dispatch( errorNotice( error.message ) );
			},
			onAssignError: ( error: Error ) =>
				dispatch( errorNotice( error.message, { isPersistent: true } ) ),
		} );
	const paymentMethodRequired = false; // FIXME: Fix this with actual data

	const maybeTrackUnsuggestedSelection = useCallback(
		( selectedLicenses: IssueLicenseRequest[] ) => {
			// No suggested products; do nothing
			if ( ! suggestedProductSlugs?.length ) {
				return;
			}

			// Selected products match the suggested ones; do nothing
			if ( containEquivalentItems( selectedLicenses, suggestedProductSlugs ) ) {
				return;
			}

			// We want to know when someone purchases different product(s)
			// from what we recommend on the dashboard
			dispatch(
				recordTracksEvent(
					'calypso_a4a_issue_multiple_licenses_changed_selection_after_dashboard_visit'
				)
			);
		},
		[ dispatch, suggestedProductSlugs ]
	);

	const submitForm = useCallback(
		( licensesToIssue: IssueLicenseRequest[] ) => {
			const serializedLicenses = serializeQueryStringProducts( licensesToIssue );
			// Record the user's intent to issue licenses for these product(s)
			dispatch(
				recordTracksEvent( 'calypso_a4a_issue_multiple_licenses_submit', {
					products: serializedLicenses,
				} )
			);

			maybeTrackUnsuggestedSelection( licensesToIssue );

			const fromDashboard = getQueryArg( window.location.href, 'source' ) === 'dashboard';

			// If we need a payment method, redirect now to have the user enter one
			if ( paymentMethodRequired ) {
				const nextStep = addQueryArgs(
					{
						products: serializedLicenses,
						...( selectedSite?.ID && { site_id: selectedSite?.ID } ),
						...( fromDashboard && { source: 'dashboard' } ),
					},
					a4aPurchasesBasePath( '/payment-methods/add' )
				);

				page( nextStep );
				return;
			}

			issueAndAssignLicenses( licensesToIssue );
		},
		[
			dispatch,
			issueAndAssignLicenses,
			maybeTrackUnsuggestedSelection,
			paymentMethodRequired,
			selectedSite?.ID,
		]
	);

	return {
		isReady: isIssueAndAssignLicensesReady,
		submitForm,
	};
};

export default useSubmitForm;
