import { isEnabled } from '@automattic/calypso-config';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import wpcomRequest from 'wpcom-proxy-request';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function useAIAssembler(): [ Function, Function, string, boolean ] {
	const [ searchParams, setSearchParams ] = useSearchParams();
	const [ prompt, setPrompt ] = useState( searchParams.get( 'ai_description' ) || '' );
	const [ loading, setLoading ] = useState( false );

	function callAIAssembler() {
		setSearchParams( ( currentSearchParams: any ) => {
			currentSearchParams.set( 'ai_description', prompt );
			return currentSearchParams;
		} );
		setLoading( true );
		return wpcomRequest( {
			path: '/pattern-assembler/ai/latest/generate',
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			body: {
				description: prompt,
				patterns_version: isEnabled( 'pattern-assembler/v2' ) ? '2' : '1',
			},
		} )
			.catch( ( err ) => {
				setLoading( false );
				console.log( 'Patterns AI error', err ); /* eslint-disable-line no-console */
				return Promise.reject( err );
			} )
			.then( ( response: any ) => {
				setLoading( false );
				console.log( 'Patterns AI response', response ); /* eslint-disable-line no-console */
				// This actually passes the patterns to the pattern assembler.
				setSearchParams(
					( currentSearchParams: any ) => {
						currentSearchParams.set( 'header_pattern_id', response.header_pattern );
						currentSearchParams.set( 'footer_pattern_id', response.footer_pattern );
						currentSearchParams.set( 'pattern_ids', response.pages[ 0 ].patterns.join( ',' ) );
						// These 2 params were introduced in the V5 of the AI endpoint.
						// TODO: Remove the checks once we settle on the endpoint.
						if ( response?.site?.site_title ) {
							currentSearchParams.set( 'site_title', response.site.site_title );
						}
						if ( response?.site?.site_tagline ) {
							currentSearchParams.set( 'site_tagline', response.site.site_tagline );
						}

						// In case we are sending the list of slugs to the assembler
						const pageSlugs = response.pages.map( ( page: any ) => page?.slug ).filter( Boolean );
						if ( pageSlugs.length ) {
							currentSearchParams.set( 'page_slugs', pageSlugs.join( ',' ) );
						}

						// In case we are sending the list of title / pattern pairs to the assembler
						// This will also filter out the "home" since it has a different format.
						const pageTitles = response.pages.filter( ( page: any ) => page?.title && page?.ID );
						if ( pageTitles.length ) {
							currentSearchParams.set( 'custom_pages', JSON.stringify( pageTitles ) );
						}

						if ( response.style ) {
							currentSearchParams.set( 'color_variation_title', response.style );
						}

						if ( response.font ) {
							currentSearchParams.set( 'font_variation_title', response.font );
						}

						// So that we close the drawer with patterns when moving to the assembler:
						currentSearchParams.set( 'screen', 'main' );
						currentSearchParams.delete( 'screen_parameter' );

						return currentSearchParams;
					},
					{ replace: true }
				);
				return Promise.resolve( response );
			} );
	}
	return [ callAIAssembler, setPrompt, prompt, loading ];
}
