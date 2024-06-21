import { type FC } from 'react';
import { generatePath, Navigate, useParams } from 'react-router';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { type StepperStep } from '../../types';

interface Props {
	slug: StepperStep[ 'slug' ];
}

export const RedirectToStep: FC< Props > = ( { slug } ) => {
	const lang = useFlowLocale();
	const { flow } = useParams();

	const to = generatePath( '/:flow/:step/:lang?', {
		flow: flow!,
		step: slug,
		lang: lang === 'en' ? null : lang,
	} );

	return <Navigate to={ `${ to }${ window.location.search }` } replace />;
};
