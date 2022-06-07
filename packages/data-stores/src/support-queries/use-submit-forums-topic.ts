import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { SiteDetails } from '../site';

type ForumTopic = {
	site?: SiteDetails;
	message: string;
	subject: string;
	locale: string;
	hideInfo: boolean;
	userDeclaredSiteUrl?: string;
};

type Response = {
	topic_URL: string;
};

export function useSubmitForumsMutation() {
	return useMutation(
		( { site, message, subject, locale, hideInfo, userDeclaredSiteUrl }: ForumTopic ) => {
			const blogHelpMessages = [];

			if ( site ) {
				if ( site.jetpack ) {
					blogHelpMessages.push( 'WP.com: Unknown' );
					blogHelpMessages.push( 'Jetpack: Yes' );
				} else {
					blogHelpMessages.push( 'WP.com: Yes' );
				}

				blogHelpMessages.push( 'Correct account: yes' );
			} else if ( userDeclaredSiteUrl ) {
				blogHelpMessages.push( `Self-declared URL: ${ userDeclaredSiteUrl }` );
			}

			const forumMessage = message + '\n\n' + blogHelpMessages.join( '\n' );

			const requestData = {
				subject,
				message: forumMessage,
				locale,
				client: 'help-center',
				hide_blog_info: hideInfo,
				blog_id: site?.ID,
				blog_url: site?.URL,
			};

			return wpcomRequest< Response >( {
				path: '/help/forums/support/topics/new',
				apiVersion: '1.1',
				method: 'POST',
				body: requestData,
			} );
		}
	);
}
