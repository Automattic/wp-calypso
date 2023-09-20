import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { TextareaControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { FormEvent, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';
import './style.scss';

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const AISitePrompt: Step = function ( props ) {
	const { goNext, goBack, submit } = props.navigation;

	const { __ } = useI18n();
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSiteIdBySlug( siteSlug ),
		[ siteSlug ]
	);
	const settings = useSelect(
		( select ) =>
			( siteId && ( select( SITE_STORE ) as SiteSelect ).getSiteSettings( siteId ) ) || {},
		[ siteId ]
	);
	const onboardingProfile = settings?.woocommerce_onboarding_profile || {};
	const [ profileChanges, setProfileChanges ] = useState< {
		[ key: string ]: string | boolean | Array< string > | undefined;
	} >( {} );

	const { saveSiteSettings } = useDispatch( SITE_STORE );

	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);

	function updateOnboardingProfile( key: string, value: string | boolean | Array< string > ) {
		setProfileChanges( {
			...profileChanges,
			[ key ]: value,
		} );
	}

	function getProfileValue( key: string ) {
		return profileChanges[ key ] || onboardingProfile?.[ key ] || '';
	}

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( siteId ) {
			const changes = {
				...profileChanges,
				[ 'completed' ]: true,
			};
			saveSiteSettings( siteId, {
				woocommerce_onboarding_profile: {
					...onboardingProfile,
					...changes,
				},
			} );
		}
		submit?.();
	};

	function getContent() {
		return (
			<>
				<div className="business-info__info-section" />
				<div className="business-info__instructions-container">
					<form onSubmit={ onSubmit }>
						<TextareaControl
							label={ __( 'Please describe your site, business and ideas in detail.' ) }
							help={ __( 'Sharing more detail here will help AI understand your intent better.' ) }
							value={ getProfileValue( 'ai_site_prompt' ) }
							onChange={ ( value ) => updateOnboardingProfile( 'ai_site_prompt', value ) }
						/>

						<ActionSection>
							<StyledNextButton type="submit">{ __( 'Continue' ) }</StyledNextButton>
						</ActionSection>
					</form>
				</div>
			</>
		);
	}

	if ( ! settings ) {
		return (
			<div className="business-info__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<div className="business-info__signup is-woocommerce-install">
			<div className="business-info__is-store-address">
				<StepContainer
					stepName="business-info"
					className={ `is-step-${ intent }` }
					skipButtonAlign="top"
					goBack={ goBack }
					goNext={ goNext }
					isHorizontalLayout={ true }
					formattedHeader={
						<FormattedHeader
							id="business-info-header"
							headerText={ __( 'Tell us a bit about the site you want.' ) }
							subHeaderText={ __( 'And let WordPress do Wonders.' ) }
							align="left"
						/>
					}
					stepContent={ getContent() }
					stepProgress={ stepProgress }
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</div>
	);
};

export default AISitePrompt;
