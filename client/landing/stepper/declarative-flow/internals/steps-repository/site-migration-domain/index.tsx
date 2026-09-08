import { Badge } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { getMigrationWizardSteps } from '../../../flows/site-migration-flow/wizard-steps';
import { useFlowState } from '../../state-manager/store';
import { MigrationWizardProgress } from '../components/migration-wizard-progress';
import type { Step as StepType } from '../../types';

import './style.scss';

type DomainChoice = 'keep' | 'free-subdomain' | 'register';

const getHost = ( url?: string | null ) => {
	if ( ! url ) {
		return '';
	}

	try {
		const { hostname } = new URL( /^https?:\/\//.test( url ) ? url : `https://${ url }` );

		return hostname.replace( /^www\./, '' );
	} catch {
		return '';
	}
};

const useSourceDomain = () => {
	const { get } = useFlowState();
	// A user can land here without passing through the earlier steps, so nothing is assumed to exist.
	const from = useQuery().get( 'from' ) ?? get( 'site-migration-identify' )?.from;
	const scannedHost = get( 'site-migration-scan' )?.analysis?.site?.host;

	return getHost( scannedHost ) || getHost( from );
};

const SiteMigrationDomain: StepType< { submits: { choice: DomainChoice } } > = ( {
	navigation,
} ) => {
	const { __ } = useI18n();
	const sourceDomain = useSourceDomain();
	const [ choice, setChoice ] = useState< DomainChoice >(
		sourceDomain ? 'keep' : 'free-subdomain'
	);

	const freeSubdomain = `${ sourceDomain.split( '.' )[ 0 ] || 'yoursite' }.wordpress.com`;

	const options: {
		value: DomainChoice;
		title: string;
		text: string;
		badge?: string;
	}[] = [
		{
			value: 'keep',
			title: sourceDomain
				? sprintf(
						/* translators: %s: the domain the site uses today, e.g. example.com. */
						__( 'Keep %s' ),
						sourceDomain
				  )
				: __( 'Keep your current domain' ),
			text: __(
				'Your address stays exactly as it is, pointing at your new site. Needs any paid plan.'
			),
			badge: __( 'Recommended' ),
		},
		{
			value: 'free-subdomain',
			title: sprintf(
				/* translators: %s: a free WordPress.com address, e.g. yoursite.wordpress.com. */
				__( 'Use %s' ),
				freeSubdomain
			),
			text: __( 'Free forever. You can connect a custom domain whenever you’re ready.' ),
		},
		{
			value: 'register',
			title: __( 'Register a new domain' ),
			text: __( 'Pick a fresh address. Free for the first year with any annual paid plan.' ),
		},
	];

	return (
		<>
			<DocumentHead title={ __( 'Keep your address, or pick a new one' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--site-migration-domain"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						centerElement={
							<MigrationWizardProgress
								steps={ getMigrationWizardSteps() }
								current="site-migration-domain"
							/>
						}
					/>
				}
				heading={
					<Step.Heading
						align="left"
						text={ __( 'Keep your address, or pick a new one' ) }
						subText={ __(
							'Visitors and search engines follow the address you choose. You can change it later.'
						) }
					/>
				}
				stickyBottomBar={ () => (
					<Step.StickyBottomBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={
							<Step.PrimaryButton onClick={ () => navigation.submit( { choice } ) }>
								{ __( 'Continue' ) }
							</Step.PrimaryButton>
						}
					/>
				) }
			>
				<div
					className="site-migration-domain__options"
					role="radiogroup"
					aria-label={ __( 'Domain' ) }
				>
					{ options.map( ( option ) => (
						<div
							key={ option.value }
							className={ clsx( 'site-migration-domain__option', {
								'is-selected': choice === option.value,
							} ) }
						>
							<label className="site-migration-domain__option-title">
								<input
									type="radio"
									name="site-migration-domain"
									value={ option.value }
									checked={ choice === option.value }
									onChange={ () => setChoice( option.value ) }
								/>
								<span>{ option.title }</span>
							</label>
							{ option.badge && (
								<Badge className="site-migration-domain__option-badge" type="info-green">
									{ option.badge }
								</Badge>
							) }
							<p className="site-migration-domain__option-text">{ option.text }</p>
						</div>
					) ) }
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationDomain;
