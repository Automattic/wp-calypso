import { useState } from 'react';
import Main from 'calypso/components/main';
import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';

type ThemesShowcasePageProps = {
	analyticsPath: string;
	analyticsPageTitle: string;
	isLoggedIn: boolean;
	filter: string;
	tier: string;
	search: string;
	vertical: string;
	canonicalUrl: string;
	children: React.ReactNode | null;
	category: string;
};

export default ( props: ThemesShowcasePageProps ) => {
	const { analyticsPath, analyticsPageTitle, isLoggedIn, children } = props;
	const [ filter, setFilter ] = useState( props.filter );
	const [ tier, setTier ] = useState( props.tier );
	const [ search, setSearch ] = useState( props.search );
	const [ vertical, setVertical ] = useState( props.vertical );
	const [ canonicalUrl, setCanonicalUrl ] = useState( props.canonicalUrl );
	const [ category, setCategory ] = useState( props.category );

	return (
		<Main fullWidthLayout className="themes" isLoggedOut={ ! isLoggedIn }>
			<PageViewTracker
				path={ analyticsPath }
				title={ analyticsPageTitle }
				properties={ { isLoggedIn } }
			/>
			<ThemesShowcaseContext.Provider
				value={ {
					filter,
					setFilter,
					tier,
					setTier,
					search,
					setSearch,
					vertical,
					setVertical,
					canonicalUrl,
					setCanonicalUrl,
					category,
					setCategory,
				} }
			>
				{ children }
			</ThemesShowcaseContext.Provider>
		</Main>
	);
};
