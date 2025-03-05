import { useMutation } from '@tanstack/react-query';
import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { AnalysisReport } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

type ForumTopic = {
	site?: SiteDetails;
	message: string;
	subject: string;
	locale: string;
	hideInfo: boolean;
	userDeclaredSiteUrl?: string;
	ownershipResult: AnalysisReport;
};

export type ForumResponse = {
	topic_URL: string;
	topic_ID: number;
	success: boolean;
};

export function useSubmitForumsMutation() {
	return useMutation( {
		mutationFn: ( {
			ownershipResult,
			message,
			subject,
			locale,
			hideInfo,
			userDeclaredSiteUrl,
		}: ForumTopic ) => {
			const site = ownershipResult.site;
			const blogHelpMessages = [];

			if ( site ) {
				blogHelpMessages.push( `WP.com: ${ ownershipResult.isWpcom ? 'Yes' : 'No' }` );
				blogHelpMessages.push( `Jetpack: ${ site.jetpack ? 'Yes' : 'No' }` );
				blogHelpMessages.push(
					`Correct account: ${ ownershipResult.result === 'OWNED_BY_USER' ? 'Yes' : 'No' }`
				);
			} else if ( userDeclaredSiteUrl ) {
				blogHelpMessages.push( `Self-declared URL: ${ userDeclaredSiteUrl }` );
				blogHelpMessages.push( 'Jetpack: Unknown' );
				blogHelpMessages.push( 'WP.com: Unknown' );
			}

			const forumMessage = message + '\n\n' + blogHelpMessages.join( '\n' );

			const requestData = {
				subject,
				message: forumMessage,
				locale,
				hide_blog_info: hideInfo,
				blog_id: site?.ID,
				blog_url: site?.URL,
			};

			return canAccessWpcomApis()
				? wpcomRequest< ForumResponse >( {
						path: '/help/forum/new',
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						body: requestData,
				  } )
				: apiFetch< ForumResponse >( {
						global: true,
						path: '/help-center/forum/new',
						method: 'POST',
						data: requestData,
				  } as APIFetchOptions );
		},
	} );
}
