import HelpCenterLoader from 'calypso/components/help-center-loader';
// import { useCurrentRoute } from 'calypso/landing/stepper/hooks/use-current-route';
// import { useSite } from 'calypso/landing/stepper/hooks/use-site';

const AsyncHelpCenter = () => {
	// TODO: The useSite uses the `useLocation`, but we are not adding it inside the router because HelpCenter also has its own router.
	// const site = useSite();

	const site = null;

	// const currentRoute = useCurrentRoute();

	// TODO: Should we set the currentRoute prop or allow the HelpCenter get the default value from `window.location`? It would probably cause issues not updating this value. Notice that the hook `useCurrentRoute` also depends on the router because it uses the `useLocation`.
	return <HelpCenterLoader site={ site } sectionName="stepper" loadHelpCenter />;
};

export default AsyncHelpCenter;
