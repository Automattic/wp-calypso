import { type Callback } from '@automattic/calypso-router';
import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import Main from 'calypso/components/main';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const paoLandingContext: Callback = ( context, next ) => {
	const isLoggedIn = isUserLoggedIn( context.store.getState() );

	context.primary = (
		<>
			<Main fullWidthLayout>
				<div>
					<h1>Hello Partner!</h1>
				</div>
			</Main>

			<UniversalNavbarFooter isLoggedIn={ isLoggedIn } />
		</>
	);

	next();
};
