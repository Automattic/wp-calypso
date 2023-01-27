/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getPlan, getPlanTermLabel } from '@automattic/calypso-products';
import {
	useSubmitTicketMutation,
	useSubmitForumsMutation,
	HelpCenterSite,
} from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { getQueryArgs } from 'calypso/lib/query-args';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { HELP_CENTER_STORE } from '../stores';
import { Mode } from '../types';

export function useContactFormCTA(
	mode: Mode,
	supportSite: HelpCenterSite,
	sectionName: string,
	ownershipResult: any,
	hideSiteInfo: boolean,
	params: URLSearchParams
) {
	const queryClient = useQueryClient();
	const email = useSelector( getCurrentUserEmail );
	const overflow = params.has( 'overflow' );
	const locale = useLocale();
	const [ hasSubmittingError, setHasSubmittingError ] = useState< boolean >( false );
	const history = useHistory();
	const { isLoading: submittingTicket, mutateAsync: submitTicket } = useSubmitTicketMutation();
	const { isLoading: submittingTopic, mutateAsync: submitTopic } = useSubmitForumsMutation();
	const isSubmitting = submittingTicket || submittingTopic;
	const { resetStore } = useDispatch( HELP_CENTER_STORE );
	const { subject, message, userDeclaredSiteUrl } = useSelect( ( select ) => {
		return {
			currentSite: select( HELP_CENTER_STORE ).getSite(),
			subject: select( HELP_CENTER_STORE ).getSubject(),
			message: select( HELP_CENTER_STORE ).getMessage(),
			userDeclaredSiteUrl: select( HELP_CENTER_STORE ).getUserDeclaredSiteUrl(),
		};
	} );

	const isCTADisabled = () => {
		if ( isSubmitting || ! message || ownershipResult?.result === 'LOADING' ) {
			return true;
		}

		switch ( mode ) {
			case 'CHAT':
				return ! supportSite;
			case 'EMAIL':
				return ! supportSite || ! subject;
			case 'FORUM':
				return ! subject;
		}
	};

	function handleCTA() {
		const productSlug = supportSite?.plan.product_slug;
		const plan = getPlan( productSlug );
		const productId = plan?.getProductId();
		const productName = plan?.getTitle();
		const productTerm = getPlanTermLabel( productSlug, ( text ) => text );

		switch ( mode ) {
			case 'CHAT':
				if ( supportSite ) {
					recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
						support_variation: 'happychat',
						force_site_id: true,
						location: 'help-center',
						section: sectionName,
					} );

					recordTracksEvent( 'calypso_help_live_chat_begin', {
						site_plan_product_id: productId,
						is_automated_transfer: supportSite.is_wpcom_atomic,
						force_site_id: true,
						location: 'help-center',
						section: sectionName,
					} );
					history.push( '/inline-chat' );
					break;
				}
				break;

			case 'EMAIL':
				if ( supportSite ) {
					const ticketMeta = [
						'Site I need help with: ' + supportSite.URL,
						`Plan: ${ productId } - ${ productName } (${ productTerm })`,
					];

					if ( getQueryArgs()?.ref === 'woocommerce-com' ) {
						ticketMeta.push(
							`Created during store setup on ${
								isWcMobileApp() ? 'Woo mobile app' : 'Woo browser'
							}`
						);
					}

					const kayakoMessage = [ ...ticketMeta, '\n', message ].join( '\n' );

					submitTicket( {
						subject: subject ?? '',
						message: kayakoMessage,
						locale,
						client: 'browser:help-center',
						is_chat_overflow: overflow,
						source: 'source_wpcom_help_center',
						blog_url: supportSite.URL,
					} )
						.then( () => {
							recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
								support_variation: 'kayako',
								force_site_id: true,
								location: 'help-center',
								section: sectionName,
							} );
							history.push( '/success' );
							resetStore();
							// reset support-history cache
							setTimeout( () => {
								// wait 30 seconds until support-history endpoint actually updates
								// yup, it takes that long (tried 5, and 10)
								queryClient.invalidateQueries( [ `activeSupportTickets`, email ] );
							}, 30000 );
						} )
						.catch( () => {
							setHasSubmittingError( true );
						} );
				}
				break;

			case 'FORUM':
				submitTopic( {
					ownershipResult,
					message: message ?? '',
					subject: subject ?? '',
					locale,
					hideInfo: hideSiteInfo,
					userDeclaredSiteUrl,
				} )
					.then( ( response ) => {
						recordTracksEvent( 'calypso_inlinehelp_contact_submit', {
							support_variation: 'forums',
							force_site_id: true,
							location: 'help-center',
							section: sectionName,
						} );
						history.push( `/success?forumTopic=${ encodeURIComponent( response.topic_URL ) }` );
						resetStore();
					} )
					.catch( () => {
						setHasSubmittingError( true );
					} );
				break;
		}
	}

	return { handleCTA, isCTADisabled, isSubmitting, hasSubmittingError };
}
