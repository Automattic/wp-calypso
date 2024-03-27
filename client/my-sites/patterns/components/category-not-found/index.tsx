import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { PatternsPageViewTracker } from 'calypso/my-sites/patterns/components/page-view-tracker';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

type PatternsCategoryNotFoundProps = {
	category: string;
	referrer?: string;
};

export const PatternsCategoryNotFound = ( {
	category,
	referrer,
}: PatternsCategoryNotFoundProps ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const translate = useTranslate();

	const emptyContentStrings = {
		title: translate( "Oops! We can't find this category!", {
			comment:
				'Message displayed when an invalid category was specified while searching block patterns',
		} ),
		line: translate( "The category you are looking for doesn't exist.", {
			comment:
				'Message displayed when an invalid category was specified while searching block patterns',
		} ),
		action: translate( 'Browse all patterns', {
			comment:
				'Message displayed when an invalid category was specified while searching block patterns',
		} ),
	};
	return (
		<>
			<PatternsPageViewTracker
				category={ category }
				referrer={ referrer }
				error="category-not-found"
			/>

			<EmptyContent
				title={ emptyContentStrings.title }
				line={ emptyContentStrings.line }
				action={ emptyContentStrings.action }
				actionURL={ isLoggedIn ? '/patterns' : addLocaleToPathLocaleInFront( '/patterns' ) }
				illustration="/calypso/images/illustrations/illustration-404.svg"
			/>
		</>
	);
};
