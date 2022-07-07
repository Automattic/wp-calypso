import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import siteVerticalImage from 'calypso/assets/images/onboarding/site-vertical.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { SITE_STORE } from '../../../../stores';
import SiteVerticalForm from './form';
import type { Step } from '../../types';
import type { Vertical } from 'calypso/components/select-vertical/types';

const SiteVertical: Step = function SiteVertical( { navigation } ) {
	const { goNext, submit } = navigation;
	const [ vertical, setVertical ] = React.useState< Vertical | null >();
	const [ isBusy, setIsBusy ] = React.useState( false );
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const site = useSite();
	const siteVertical = useSelect(
		( select ) => ( site && select( SITE_STORE ).getSiteVerticalId( site?.ID ) ) || undefined
	);
	const translate = useTranslate();
	const headerText = translate( 'What’s your website about?' );
	const subHeaderText = translate( 'Choose a category that defines your website the best.' );
	const isSkipSynonyms = useQuery().get( 'isSkipSynonyms' );

	const handleSiteVerticalSelect = ( vertical: Vertical ) => {
		setVertical( vertical );
	};

	const handleSubmit = async ( event: React.FormEvent, userInput: string ) => {
		event.preventDefault();

		if ( site ) {
			const { value = '', label = '' } = vertical || {};

			setIsBusy( true );
			await saveSiteSettings( site.ID, {
				site_vertical_id: value,
				blogname: label,
			} );
			recordTracksEvent( 'calypso_signup_site_vertical_submit', {
				user_input: userInput,
				vertical_id: value,
				vertical_title: label,
			} );
			setIsBusy( false );
			submit?.();
		}
	};

	if ( ! site ) {
		return null;
	}

	return (
		<>
			<StepContainer
				stepName={ 'site-vertical' }
				goNext={ goNext }
				headerImageUrl={ siteVerticalImage }
				skipLabelText={ translate( 'Skip to dashboard' ) }
				skipButtonAlign={ 'top' }
				isHorizontalLayout={ true }
				hideBack={ true }
				formattedHeader={
					<FormattedHeader
						id={ 'site-vertical-header' }
						headerText={ headerText }
						subHeaderText={ subHeaderText }
						align={ 'left' }
					/>
				}
				stepContent={
					<>
						<button
							onClick={ ( e ) => {
								e.preventDefault();
								submit?.( { data: { error: 'OH NO! 🙀', message: 'This is an error message!' } } );
							} }
							className="button site-vertical__submit-button is-primary"
							style={ {
								position: 'absolute',
								bottom: '249px',
								right: '280px',
							} }
						>
							Error 1
						</button>
						<button
							onClick={ ( e ) => {
								e.preventDefault();
								submit?.( {
									data: { error: '😱😱😱😱😱', message: 'Something else bad happened!' },
								} );
							} }
							className="button site-vertical__submit-button is-primary"
							style={ {
								position: 'absolute',
								bottom: '249px',
								right: '130px',
							} }
						>
							Error 2
						</button>
						<SiteVerticalForm
							defaultVertical={ siteVertical }
							isSkipSynonyms={ Boolean( isSkipSynonyms ) }
							isBusy={ isBusy }
							onSelect={ handleSiteVerticalSelect }
							onSubmit={ handleSubmit }
						/>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteVertical;
