import { getHostingLogo } from '../../lib/hosting';

import './style.scss';

interface HostingOverviewProps {
	slug?: string;
	title: string;
	subtitle: string;
}

export default function HostingOverview( { slug, title, subtitle }: HostingOverviewProps ) {
	return (
		<section className="hosting-overview__banner">
			{ slug && <div className="hosting-overview__banner-logo">{ getHostingLogo( slug ) }</div> }
			<h1 className="hosting-overview__banner-title">{ title }</h1>
			<h2 className="hosting-overview__banner-subtitle">{ subtitle }</h2>
		</section>
	);
}
