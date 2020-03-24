/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { submitSignupStep } from 'state/signup/progress/actions';

export default function ProvideThemeStep( { stepName, queryObject, goToNextStep } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		const themeSlug = queryObject.theme;
		const themeSlugWithRepo = `pub/${ themeSlug }`;

		dispatch(
			submitSignupStep(
				{
					stepName,
				},
				{
					themeSlug,
					themeSlugWithRepo,
				}
			)
		);

		goToNextStep();
	}, [ queryObject.theme ] );

	return null;
}
