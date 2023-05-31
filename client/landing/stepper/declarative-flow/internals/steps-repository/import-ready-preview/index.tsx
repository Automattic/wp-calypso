import { OnboardSelect, SiteSelect, Visibility } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useEffect } from 'react';
import { ReadyPreviewStep } from 'calypso/blocks/import/ready';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { getSiteSuggestions } from 'calypso/landing/stepper/hooks/use-get-site-suggestions-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { ImportWrapper } from '../import';
import { BASE_ROUTE } from '../import/config';
import { getFinalImporterUrl } from '../import/helper';

import './style.scss';

const ImportReadyPreview: Step = function ImportStep( props ) {
	const { navigation } = props;
	const siteSlug = useSiteSlugParam();
	const site = useSite();
	const { createSite } = useDispatch( SITE_STORE );
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
	const isAtomicSite = !! site?.options?.is_automated_transfer;
	const urlData = useSelector( getUrlData );
	const isMigrateFromWp = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
		[]
	);

	/**
	 ↓ Effects
	 */
	// redirect to home step if urlData is not available
	useEffect( () => {
		! urlData && goToHomeStep();
	}, [ urlData, navigation ] );

	// redirect directly to importer page if it comes from move to wpcom plugin
	useEffect( () => {
		urlData && isMigrateFromWp && goToImporterPage();
	}, [ urlData, isMigrateFromWp ] );

	/**
	 ↓ Methods
	 */
	async function goToImporterPage() {
		let slug = site?.slug ?? siteSlug;
		if ( ! slug ) {
			let blogName = urlData.meta.title;

			if ( ! blogName ) {
				const response = await getSiteSuggestions();

				if ( response.success ) {
					blogName = response.suggestions[ 0 ].title;
				}
			}

			await createSite( {
				blog_name: blogName,
				authToken: undefined,
				visibility: Visibility.Private,
			} );

			const newSite = getNewSite();

			if ( ! newSite?.site_slug ) {
				throw new Error( 'failed to create site. huh?' );
			}

			slug = newSite.site_slug;
		}

		const url = getFinalImporterUrl( slug, urlData.url, urlData.platform, isAtomicSite, 'stepper' );

		navigation.submit?.( { url } );
	}

	function goToHomeStep() {
		navigation.goToStep?.( BASE_ROUTE );
	}

	/**
	 ↓ Renders
	 */
	if ( ! urlData ) {
		return null;
	}

	return (
		<ImportWrapper { ...props }>
			<ReadyPreviewStep
				urlData={ urlData }
				siteSlug={ siteSlug as string }
				goToImporterPage={ goToImporterPage }
				recordTracksEvent={ recordTracksEvent }
			/>
		</ImportWrapper>
	);
};

export default ImportReadyPreview;
