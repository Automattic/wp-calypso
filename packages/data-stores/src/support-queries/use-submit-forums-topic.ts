import apiFetch, { APIFetchOptions } from '@wordpress/api-fetch';
import { useMutation } from 'react-query';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { AnalysisReport } from '../queries/use-site-analysis';
import { SiteDetails } from '../site';

type ForumTopic = {
	site?: SiteDetails;
	message: string;
	subject: string;
	locale: string;
	hideInfo: boolean;
	userDeclaredSiteUrl?: string;
	ownershipResult: AnalysisReport;
};

export function useSubmitForumsMutation() {
	return useMutation(
		( {
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
				if ( site.jetpack ) {
					blogHelpMessages.push( 'WP.com: Unknown' );
					blogHelpMessages.push( 'Jetpack: Yes' );
				} else {
					blogHelpMessages.push( `WP.com: ${ ownershipResult.isWpcom ? 'Yes' : 'No' }` );
					blogHelpMessages.push( 'Jetpack: No' );
				}

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
				? wpcomRequest( {
						path: 'help/forum/new',
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
						method: 'POST',
						body: requestData,
				  } )
				: apiFetch( {
						global: true,
						path: '/help-center/forum/new',
						method: 'POST',
						data: requestData,
				  } as APIFetchOptions );
		}
	);
}
