import SiteList from '../site-list/site-list';

// Mock meanwhile we have the data endpoints ready
const useSites = () => {
	const sites = [];
	for ( let i = 0; i < 10; i++ ) {
		sites.push( {
			id: i,
			name: `Site ${ i }`,
			icon: `https://www.gravatar.com/avatar/${ i }?s=96&d=mm`,
			url: `https://site${ i }.wordpress.com`,
			date: new Date(),
			emailFrequency: [ 'Daily', 'Weekly', 'Immediately' ][ Math.floor( Math.random() * 3 ) ],
		} );
	}
	return sites;
};

export default function SitesView() {
	const sites = useSites();

	return <SiteList sites={ sites } />;
}
