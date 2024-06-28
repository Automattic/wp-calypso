import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { getSiteFragment } from 'calypso/lib/route';
import { setNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import ProfileMain from './main';

export default {
	redirectToTeam,

	enforceSiteEnding( context, next ) {
		const siteId = getSiteFragment( context.path );

		if ( ! siteId ) {
			redirectToTeam( context );
		}

		next();
	},

	personSiteLevelProfile( context, next ) {
		renderPersonSiteLevelProfile( context, next );
	},
};

function redirectToTeam( context ) {
	if ( context ) {
		// if we are redirecting we need to retain our intended layout-focus
		const currentLayoutFocus = getCurrentLayoutFocus( context.store.getState() );
		context.store.dispatch( setNextLayoutFocus( currentLayoutFocus ) );
	}
	page.redirect( '/people/team' );
}

function renderPersonSiteLevelProfile( context, next ) {
	const ProfileTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'My Profile', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<ProfileTitle />
			<ProfileMain path={ context.path } />
		</>
	);
	next();
}
