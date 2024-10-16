import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

type Props = {
	title: string;
	path: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	properties?: any;
};

export default function A4APageViewTracker( { title, path, properties }: Props ) {
	// Split the path into its components
	const [ basePath ] = path.split( /[?]/ );

	return (
		<PageViewTracker
			title={ title }
			path={ basePath }
			properties={ properties }
			options={ { useA8CForAgenciesGoogleAnalytics: true } }
		/>
	);
}
