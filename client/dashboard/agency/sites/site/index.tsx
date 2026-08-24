import { Outlet } from '@tanstack/react-router';

// The route loader throws `notFound()` when the site isn't in the agency's
// list, so children can rely on the site existing.
export default function AgencySite() {
	return <Outlet />;
}
