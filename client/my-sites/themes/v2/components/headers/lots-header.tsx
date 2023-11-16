import { useContext } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { preventWidows } from 'calypso/lib/formatting';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';
import useThemeShowcaseLoggedOutSeoContent from '../../../use-theme-showcase-logged-out-seo-content';
import './lots-header.scss';

type LotsHeaderProps = {
	children?: React.ReactNode | null;
};

export default ( props: LotsHeaderProps ) => {
	const { tier, filter, canonicalUrl } = useContext( ThemesShowcaseContext );
	const themeSeo = useThemeShowcaseLoggedOutSeoContent( filter, tier );

	const metas = [
		{
			name: 'description',
			property: 'og:description',
			content: themeSeo.header,
		},
		{ property: 'og:title', content: themeSeo.title },
		{ property: 'og:url', content: canonicalUrl },
		{ property: 'og:type', content: 'website' },
		{ property: 'og:site_name', content: 'WordPress.com' },
	];

	return (
		<>
			<DocumentHead title={ themeSeo.title } meta={ metas } />
			<div className="themes__header-logged-out">
				<div className="themes__page-heading">
					<h1>{ preventWidows( themeSeo.header ) }</h1>
					<p className="page-sub-header">{ preventWidows( themeSeo.description ) }</p>
				</div>
				{ props.children }
			</div>
		</>
	);
};
