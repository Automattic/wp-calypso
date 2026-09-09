import { getPlan } from '@automattic/calypso-products';
import { Step } from '@automattic/onboarding';
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

const SiteMigrationReview: StepType< { submits: { action: 'migrate' } } > = ( { navigation } ) => {
	const { __ } = useI18n();
	const { get } = useFlowState();
	const urlQueryParams = useQuery();

	// The scan step is parked, so there is no analysis to read yet and every row
	// below falls back. It hands the analysis over in flow state when it returns.
	const analysis = get( 'site-migration-scan' )?.analysis;
	const counts = analysis?.counts;
	const from = urlQueryParams.get( 'from' );

	const destination = get( 'site-migration-destination' )?.destination;
	const domainChoice = get( 'site-migration-domain' )?.choice;
	const planSlug = get( 'plans' )?.cartItems?.[ 0 ]?.product_slug;

	const unknown = __( 'Not selected yet' );

	const destinationLabels: Record< string, string > = {
		wpcom: __( 'WordPress.com' ),
		'space-fast': __( 'Space Fast' ),
	};
	const destinationLabel = ( destination && destinationLabels[ destination ] ) || unknown;

	let domainLabel: string = unknown;
	if ( domainChoice === 'keep' ) {
		domainLabel = analysis?.site.host
			? sprintf(
					/* translators: %s: the domain the user is migrating from, e.g. “example.com”. */
					__( 'Keep %s' ),
					analysis.site.host
			  )
			: __( 'Keep your current address' );
	} else if ( domainChoice === 'free-subdomain' ) {
		domainLabel = __( 'A free WordPress.com address' );
	} else if ( domainChoice === 'register' ) {
		domainLabel = __( 'A new domain' );
	}

	const planLabel = planSlug ? getPlan( planSlug )?.getTitle() ?? planSlug : __( 'Free plan' );

	const summary: { key: string; label: string; value: ReactNode }[] = [
		{
			key: 'source',
			label: __( 'Site' ),
			value: analysis?.site.title ?? analysis?.site.host ?? from ?? unknown,
		},
		{ key: 'destination', label: __( 'Moving to' ), value: destinationLabel },
		{ key: 'domain', label: __( 'Address' ), value: domainLabel },
		{ key: 'plan', label: __( 'Plan' ), value: planLabel },
		{
			key: 'content',
			label: __( 'What comes across' ),
			value: counts ? (
				<ul className="site-migration-review__counts">
					<li>
						{ sprintf(
							/* translators: %d: number of pages found on the source site. */
							__( '%d pages' ),
							counts.pages
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of posts found on the source site. */
							__( '%d posts' ),
							counts.posts
						) }
					</li>
					<li>
						{ sprintf(
							/* translators: %d: number of images found on the source site. */
							__( '%d images' ),
							counts.images
						) }
					</li>
				</ul>
			) : (
				__( 'We’ll confirm this once your site has been read.' )
			),
		},
	];

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
				heading={
					<Step.Heading text={ heading } subText={ __( 'Nothing moves until you hit Migrate.' ) } />
				}
				stickyBottomBar={ () => (
					<Step.StickyBottomBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={
							<Step.PrimaryButton onClick={ () => navigation.submit( { action: 'migrate' } ) }>
								{ __( 'Migrate' ) }
							</Step.PrimaryButton>
						}
					/>
				) }
			>
				<dl className="site-migration-review__summary">
					{ summary.map( ( { key, label, value } ) => (
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
