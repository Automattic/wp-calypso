import { translate, fixMe } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import TitanRedirector from 'calypso/my-sites/email/titan-redirector';

export default {
	emailTitanAddMailboxes( pageContext, next ) {
		pageContext.primary = (
			<TitanRedirector
				mode={ pageContext.params.mode }
				jwt={ pageContext.query.jwt }
				redirectUrl={ pageContext.query.redirect_url }
			/>
		);

		next();
	},
	notFound( pageContext, next ) {
		pageContext.primary = (
			<EmptyContent
				title={ fixMe( {
					text: 'Page not found.',
					newCopy: translate( 'Page not found.' ),
					oldCopy: translate( 'Uh oh. Page not found.' ),
				} ) }
				line={ translate(
					"Sorry, the page you were looking for doesn't exist or has been moved."
				) }
			/>
		);

		next();
	},
};
