import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import siteOptionsImage from 'calypso/assets/images/onboarding/site-options.svg';
import storeImageUrl from 'calypso/assets/images/onboarding/store-onboarding.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch } from 'calypso/state';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SiteOptions from './site-options';
import type { SiteOptionsFormValues } from './types';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

export default function SiteOptionsStep( props: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, signupDependencies, goToNextStep } = props;
	const { siteTitle, tagline } = signupDependencies;

	const getSiteOptionsProps = ( stepName: string ) => {
		switch ( stepName ) {
			case 'store-options':
				return {
					headerText: translate( "First, let's give your store a name" ),
					headerImage: storeImageUrl,
					siteTitleLabel: translate( 'Store name' ),
					taglineExplanation: translate( 'In a few words, explain what your store is about.' ),
				};
			case 'difm-store-options':
				return {
					headerText: translate( "First, let's give your store a name" ),
					headerImage: storeImageUrl,
					siteTitleLabel: translate( 'Store name' ),
					siteTitleExplanation: translate( 'Enter the name of your business or store.' ),
					taglineExplanation: translate( 'In a few words, explain what your store is about.' ),
					isSiteTitleRequired: true,
					acceptSearchTerms: true,
					searchTermsExplanation: translate(
						'What phrases would someone search on Google to find you?'
					),
				};
			case 'difm-options':
				return {
					headerText: translate( "First, let's give your site a name" ),
					headerImage: siteOptionsImage,
					siteTitleLabel: translate( 'Site name' ),
					siteTitleExplanation: translate( 'Enter the name of your business or project.' ),
					taglineExplanation: translate( 'In a few words, explain what your site is about.' ),
					isSiteTitleRequired: true,
					acceptSearchTerms: true,
					searchTermsExplanation: translate(
						'What phrases would someone search on Google to find you?'
					),
				};

			// Regular blog
			default:
				return {
					headerText: translate( "First, let's give your blog a name" ),
					headerImage: siteOptionsImage,
					siteTitleLabel: translate( 'Blog name' ),
					taglineExplanation: translate( 'In a few words, explain what your blog is about.' ),
				};
		}
	};

	const {
		headerText,
		headerImage,
		siteTitleLabel,
		siteTitleExplanation,
		taglineExplanation,
		isSiteTitleRequired,
		acceptSearchTerms,
		searchTermsExplanation,
	} = getSiteOptionsProps( stepName );

	const submitSiteOptions = ( { siteTitle, tagline, searchTerms }: SiteOptionsFormValues ) => {
		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
			has_tagline: !! tagline,
			has_search_terms: !! searchTerms,
		} );
		dispatch( submitSignupStep( { stepName }, { siteTitle, tagline, searchTerms } ) );
		goToNextStep();
	};

	// Only do following things when mounted
	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText=""
			fallbackSubHeaderText=""
			headerImageUrl={ headerImage }
			stepContent={
				<SiteOptions
					defaultSiteTitle={ siteTitle }
					defaultTagline={ tagline }
					siteTitleLabel={ siteTitleLabel }
					siteTitleExplanation={ siteTitleExplanation }
					taglineExplanation={ taglineExplanation }
					isSiteTitleRequired={ isSiteTitleRequired }
					acceptSearchTerms={ acceptSearchTerms }
					searchTermsExplanation={ searchTermsExplanation }
					onSubmit={ submitSiteOptions }
				/>
			}
			align="left"
			skipButtonAlign="top"
			skipLabelText={ translate( 'Skip this step' ) }
			isHorizontalLayout={ true }
			defaultDependencies={ {
				siteTitle: '',
				tagline: '',
				searchTerms: '',
			} }
			{ ...props }
		/>
	);
}
