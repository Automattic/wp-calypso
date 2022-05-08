import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { SiteDetails } from '../site';

type ForumTopic = {
	site: SiteDetails;
	message: string;
	subject: string;
	locale: string;
	hideInfo: boolean;
};

type Response = {
	topic_URL: string;
};

// for some reason, useMutation isn't returning mutateAsync in its type, this is a bandage for that
type MutationResult = {
	isLoading: boolean;
	mutateAsync: ( topic: ForumTopic ) => Promise< Response >;
};

export function useSubmitForumsMutation(): MutationResult {
	return useMutation( ( { site, message, subject, locale, hideInfo }: ForumTopic ) => {
		const blogHelpMessages = [ message ];

		if ( site.jetpack ) {
			blogHelpMessages.push( 'WP.com: Unknown' );
			blogHelpMessages.push( 'Jetpack: Yes' );
		} else {
			blogHelpMessages.push( 'WP.com: Yes' );
		}

		blogHelpMessages.push( 'Correct account: yes' );

		const forumMessage = message + '\n\n' + 'Correct account: yes';

		const requestData = {
			subject,
			message: forumMessage,
			locale,
			client: 'help-center',
			hide_blog_info: hideInfo,
			blog_id: site.ID,
			blog_url: site.URL,
		};

		return wpcomRequest< Response >( {
			path: '/help/forums/support/topics/new',
			apiVersion: '1.1',
			method: 'POST',
			body: requestData,
		} );
	} ) as unknown as MutationResult;
}
