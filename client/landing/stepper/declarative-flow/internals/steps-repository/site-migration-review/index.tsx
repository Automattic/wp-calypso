import { STATIC_SITE_IMPORT_TERMINAL_STATES } from '@automattic/api-core';
import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';
import type { ReactNode } from 'react';

import './style.scss';

const SLUG = 'site-migration-review';
const POLL_INTERVAL = 5000;

export type SiteMigrationReviewSubmits = {
	action: 'migrate';
	sessionId?: string;
	archiveHash?: string;
};

const SiteMigrationReview: StepType< { submits: SiteMigrationReviewSubmits } > = ( {
	navigation,
} ) => {
	const { __, _n } = useI18n();
	const { get } = useFlowState();
	const urlQueryParams = useQuery();

	const from = urlQueryParams.get( 'from' ) ?? get( 'site-migration-identify' )?.from ?? '';

	/**
	 * The session the capture step started. Not Stepper's own `sessionId` query
	 * parameter, which is its flow-state key and is on every step URL.
	 */
	const sessionId =
		urlQueryParams.get( 'importSessionId' ) ?? get( 'site-migration-capture' )?.sessionId ?? '';

	const { data: session } = useReactQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		enabled: Boolean( sessionId ),
		refetchInterval: ( query ) => {
			const state = query.state.data?.state;
			if ( ! state ) {
				return POLL_INTERVAL;
			}
			return state === 'preview_ready' || STATIC_SITE_IMPORT_TERMINAL_STATES.includes( state )
				? false
				: POLL_INTERVAL;
		},
	} );

	/**
	 * Approval is bound to the hash of the archive that was built. Handing it to the
	 * flow from here is what makes this screen the point of review: the import step
	 * only approves a hash the user was actually shown.
	 */
	const archiveHash = session?.state === 'preview_ready' ? session.archive_hash : undefined;
	const summary = session?.preview_summary;
	const hasFailed = session?.state === 'failed';

	const unknown = __( 'Not read yet' );

	let contentValue: ReactNode = __( 'We’re still reading your site.' );
	if ( hasFailed ) {
		contentValue = __( 'We couldn’t read your site.' );
	} else if ( summary ) {
		/**
		 * Two things decide what goes on this list: whether the number can be
		 * trusted, and whether it means anything to someone about to buy a plan.
		 *
		 * `pages` has the strongest guarantee — the API rejects a build whose report
		 * has no `pages`, so it is there or the import never happened. `diagnostics`
		 * is dropped wholesale when the build reported nothing, so an absent one is
		 * distinguishable from a clean one; hence the truthiness check rather than
		 * `!== undefined`.
		 *
		 * `documents`, `theme` and the other `counts` values are reliable too, they
		 * just do not tell the user anything `pages` has not already said. Add them
		 * only if they earn their place.
		 *
		 * `blocks` is the exception and must stay off this screen. It is the only
		 * count read from a separate diagnostics envelope in the build report, and a
		 * missing envelope degrades to 0 rather than to absent — so a perfectly good
		 * import reports `blocks: 0`, which reads as "we built nothing".
		 */
		const lines = [
			summary.pages !== undefined &&
				sprintf(
					/* translators: %d: number of pages read from the source site. */
					_n( '%d page', '%d pages', summary.pages ),
					summary.pages
				),
			summary.diagnostics?.total
				? sprintf(
						/* translators: %d: number of notes the build reported. */
						_n( '%d thing to check', '%d things to check', summary.diagnostics.total ),
						summary.diagnostics.total
				  )
				: false,
		].filter( Boolean ) as string[];

		contentValue = lines.length ? (
			<ul className="site-migration-review__counts">
				{ lines.map( ( line ) => (
					<li key={ line }>{ line }</li>
				) ) }
			</ul>
		) : (
			__( 'Your site is ready to move.' )
		);
	}

	const rows: { key: string; label: string; value: ReactNode }[] = [
		{ key: 'source', label: __( 'Site' ), value: from || unknown },
		{ key: 'destination', label: __( 'Moving to' ), value: __( 'A new WordPress.com site' ) },
		{ key: 'plan', label: __( 'Plan' ), value: __( 'You’ll pick one next' ) },
		{ key: 'content', label: __( 'What comes across' ), value: contentValue },
	];

	let subText: string = __( 'Nothing moves until you continue.' );
	if ( hasFailed ) {
		subText = __( 'We couldn’t read your site. Nothing has been set up, and you haven’t paid.' );
	} else if ( ! archiveHash ) {
		subText = __( 'We’re still reading your site. This only takes a minute.' );
	}

	const heading = __( 'Review your migration' );

	return (
		<>
			<DocumentHead title={ heading } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-review"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						centerElement={
							<MigrationWizardProgress steps={ getMigrationWizardSteps() } current={ SLUG } />
						}
					/>
				}
				heading={ <Step.Heading text={ heading } subText={ subText } /> }
				stickyBottomBar={ () => (
					<Step.StickyBottomBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={
							<Step.PrimaryButton
								disabled={ ! archiveHash }
								onClick={ () => navigation.submit( { action: 'migrate', sessionId, archiveHash } ) }
							>
								{ /* The next stop is the plan picker and checkout, not the import. */ }
								{ __( 'Continue to checkout' ) }
							</Step.PrimaryButton>
						}
					/>
				) }
			>
				<dl className="site-migration-review__summary">
					{ rows.map( ( { key, label, value } ) => (
						<div className="site-migration-review__row" key={ key }>
							<dt>{ label }</dt>
							<dd>{ value }</dd>
						</div>
					) ) }
				</dl>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationReview;
