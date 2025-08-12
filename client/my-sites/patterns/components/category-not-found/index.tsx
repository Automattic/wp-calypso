import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useTranslate, fixMe } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

export const PatternsCategoryNotFound = () => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const translate = useTranslate();

	const title = fixMe( {
		text: "We can't find this category!",
		newCopy: translate( "We can't find this category!", {
			comment:
				'Heading displayed when an invalid category was specified while searching block patterns',
		} ),
		oldCopy: translate( "Oops! We can't find this category!", {
			comment:
				'Heading displayed when an invalid category was specified while searching block patterns',
		} ),
	} );

	const line = translate( "The category you are looking for doesn't exist.", {
		comment:
			'Message displayed when an invalid category was specified while searching block patterns',
	} );

	const action = translate( 'Browse all patterns', {
		comment:
			'Label of the button displayed when an invalid category was specified while searching block patterns',
	} );

	return (
		<>
			<PatternsPageViewTracker error="category-not-found" />

			<EmptyContent
				title={ title }
				line={ line }
				action={ action }
				actionURL={ isLoggedIn ? '/patterns' : addLocaleToPathLocaleInFront( '/patterns' ) }
			/>
		</>
	);
};
