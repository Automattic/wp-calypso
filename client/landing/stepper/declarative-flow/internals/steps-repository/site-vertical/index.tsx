import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
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
	const { saveSiteSettings } = useDispatch( SITE_STORE );
	const site = useSite();
	const translate = useTranslate();
	const headerText = translate( 'What’s your website about?' );
	const subHeaderText = translate( 'Choose a category that defines your website the best.' );
	const isSkipSynonyms = useQuery().get( 'isSkipSynonyms' );

	const handleSiteVerticalSelect = ( vertical: Vertical ) => {
		setVertical( vertical );
	};

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( site && vertical ) {
			const vertical_id = vertical.value;

			await saveSiteSettings( site.ID, { site_vertical: vertical_id } );
			recordTracksEvent( 'calypso_signup_site_vertical_submit', {
				vertical_id,
				vertical_title: vertical.label,
			} );

			submit?.();
		}
	};

	return (
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
				<SiteVerticalForm
					isSkipSynonyms={ Boolean( isSkipSynonyms ) }
					onSelect={ handleSiteVerticalSelect }
					onSubmit={ handleSubmit }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteVertical;
