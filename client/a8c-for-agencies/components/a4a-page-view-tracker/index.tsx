import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

type Props = {
	title: string;
	path: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	properties?: any;
};

export default function A4APageViewTracker( { title, path, properties }: Props ) {
	return (
		<PageViewTracker
			title={ title }
			path={ path }
			properties={ properties }
			options={ { useA8CForAgenciesGoogleAnalytics: true } }
		/>
	);
}
