import { useMyDomainInputMode } from '@automattic/api-core';
import page from '@automattic/calypso-router';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import UseMyDomainForm from 'calypso/components/domains/use-my-domain';
import { WPCOMDomainSearchCartProvider } from 'calypso/components/domains/wpcom-domain-search/domain-search-cart-provider';
import { domainMapping, domainTransfer } from 'calypso/lib/cart-values/cart-items';
import StepWrapper from '../../step-wrapper';
import { getStepUrl } from '../../utils';
import type { StepProps } from './types';

export const USE_MY_DOMAIN_SECTION_NAME = 'use-your-domain';

export const UseMyDomain = ( {
	flowName,
	stepName,
	locale,
	onSubmit,
	onSkip,
}: StepProps & { onSubmit( domain: MinimalRequestCartProduct ): void; onSkip(): void } ) => {
	const queryObject = new URLSearchParams( window.location.search );
	const initialQuery = queryObject.get( 'initialQuery' ) ?? '';
	const mode = queryObject.get( 'step' ) ?? useMyDomainInputMode.domainInput;

	return (
		<WPCOMDomainSearchCartProvider>
			<UseMyDomainForm
				analyticsSection={ flowName === 'domain' ? 'domain-first' : 'signup' }
				initialQuery={ initialQuery }
				initialMode={ mode }
				isSignupStep
				onNextStep={ ( { mode: newStep, domain }: { mode: string; domain: string } ) => {
					page(
						getStepUrl( flowName, stepName, USE_MY_DOMAIN_SECTION_NAME, locale, {
							step: newStep,
							initialQuery: domain,
						} )
					);
				} }
				goBack={ () => {
					page( getStepUrl( flowName, stepName, '', locale ) );
				} }
				onTransfer={ ( { domain, authCode }: { domain: string; authCode: string } ) => {
					const domainItem = domainTransfer( {
						domain,
						extra: {
							auth_code: authCode,
							signup: true,
						},
					} );

					onSubmit( domainItem );
				} }
				onConnect={ ( { domain }: { domain: string } ) => {
					const domainItem = domainMapping( { domain } );

					onSubmit( domainItem );
				} }
				onSkip={ onSkip }
				render={ ( {
					onGoBack,
					headerText,
					content,
				}: {
					onGoBack: () => void;
					headerText: string;
					content: React.ReactNode;
				} ) => (
					<StepWrapper
						goToPreviousStep={ onGoBack }
						flowName={ flowName }
						stepName={ stepName }
						stepSectionName={ USE_MY_DOMAIN_SECTION_NAME }
						hideSkip
						fallbackHeaderText={ headerText }
						subHeaderText=""
						stepContent={ content }
					/>
				) }
			/>
		</WPCOMDomainSearchCartProvider>
	);
};
