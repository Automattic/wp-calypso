/* eslint-disable no-restricted-imports */
/* eslint-disable wpcalypso/jsx-classname-namespace */

import { LoadingPlaceholder } from '@automattic/components';
import { HelpCenterSelect, useJetpackSearchAIQuery } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import stripTags from 'striptags';
import './help-center-article-content.scss';
import { HELP_CENTER_STORE } from '../stores';

export const SITE_STORE = 'automattic/site' as const;

const GPTResponsePlaceholder = styled( LoadingPlaceholder )< { width?: string } >`
	:not( :last-child ) {
		margin-block-end: 0.5rem;
	}
	width: ${ ( { width = '100%' } ) => width };
`;

const GPTResponseDisclaimer = styled.div`
	color: var( --studio-gray-50 );
	font-size: 11px;
	text-align: right;

	@media ( min-width: 600px ) {
		padding: 5px 0;
	}
`;

interface Props {
	loadingMessage: string;
}

const LoadingPlaceholders: React.FC< Props > = ( { loadingMessage } ) => (
	<>
		<i>{ loadingMessage }</i>
		<GPTResponsePlaceholder width="80%" />
		<GPTResponsePlaceholder width="80%" />
		<GPTResponsePlaceholder width="55%" />
	</>
);

const getLoadingMessageIndex = ( () => {
	let currentIndex = 0;

	return ( messagesLength: number ): number => {
		currentIndex = currentIndex + 1;

		if ( currentIndex > messagesLength ) {
			return messagesLength;
		}

		return currentIndex;
	};
} )();

export function HelpCenterGPT() {
	const { __ } = useI18n();

	// Report loading state up.
	const { message } = useSelect(
		( select ) => ( {
			message: ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getMessage(),
		} ),
		[]
	);

	const loadingMessages: string[] = [
		__( 'Finding relevant support documentation…', __i18n_text_domain__ ),
		__( 'Gathering all the data…', __i18n_text_domain__ ),
		__( 'Thanks for your patience, this might take a bit…', __i18n_text_domain__ ),
		__( 'Processing the information found…', __i18n_text_domain__ ),
		__( "I'm still writing, thank you for your patience!", __i18n_text_domain__ ),
		__( 'Any minute now…', __i18n_text_domain__ ),
		__( 'Really, any minute now…', __i18n_text_domain__ ),
	];

	const [ loadingMessage, setLoadingMessage ] = useState( loadingMessages[ 0 ] );

	const query = message ?? '';

	// First fetch the links
	const { isFetching: isFetchingLinks, data: links } = useJetpackSearchAIQuery(
		'9619154',
		query,
		'urls'
	);

	// Then fetch the response
	const { isFetching: isFetchingResponse, data } = useJetpackSearchAIQuery(
		'9619154',
		links?.urls ? query : '',
		'response'
	);

	const allowedTags = [ 'a', 'p', 'ol', 'ul', 'li', 'br', 'b', 'strong', 'i', 'em' ];

	useEffect( () => {
		let intervalId: NodeJS.Timeout | null = null;

		if ( isFetchingLinks || isFetchingResponse ) {
			intervalId = setInterval( () => {
				setLoadingMessage( () => {
					const nextIndex = getLoadingMessageIndex( loadingMessages.length );
					const nextLoadingMessage = loadingMessages[ nextIndex ];
					return nextLoadingMessage;
				} );
			}, 5000 );
		}

		return () => {
			if ( intervalId ) {
				clearInterval( intervalId );
			}
		};
	}, [ isFetchingLinks, isFetchingResponse ] );

	return (
		<div className="help-center-gpt__container">
			<h3 id="help-center--contextual_help_query" className="help-center__section-title">
				{ __( 'Your message', __i18n_text_domain__ ) }
			</h3>
			<div className="help-center-gpt-query">{ query }</div>
			<h3 id="help-center--contextual_help" className="help-center__section-title">
				{ __( 'AI generated response', __i18n_text_domain__ ) }
			</h3>
			<div className="help-center-gpt-response">
				{ ! data?.response && LoadingPlaceholders( { loadingMessage } ) }
				{ data?.response && (
					<div
						className="help-center-gpt-response__content"
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ {
							__html: stripTags( data.response, allowedTags ),
						} }
					/>
				) }
				<GPTResponseDisclaimer>
					{ __( "Generated by WordPress.com's Support AI", __i18n_text_domain__ ) }
				</GPTResponseDisclaimer>
			</div>
		</div>
	);
}
