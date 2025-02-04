import { type FC } from 'react';
import { generatePath, Navigate, useParams } from 'react-router';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { type StepperStep } from '../../types';

interface Props {
	slug: StepperStep[ 'slug' ];
}

export const RedirectToStep: FC< Props > = ( { slug } ) => {
	const { flow, lang = null } = useParams();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const to = generatePath( '/:flow/:step/:lang?', {
		flow: flow!,
		step: slug,
		lang: lang === 'en' || isLoggedIn ? null : lang,
	} );

	return <Navigate to={ `${ to }${ window.location.search }` } replace />;
};
