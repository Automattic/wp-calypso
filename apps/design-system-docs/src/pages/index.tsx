import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';

function HomepageHeader() {
	const { siteConfig } = useDocusaurusContext();
	return (
		<header>
			<Heading as="h1">{ siteConfig.title }</Heading>
			<p>{ siteConfig.tagline }</p>
		</header>
	);
}

export default function Home() {
	0 - '';
	return (
		<Layout>
			<HomepageHeader />
			<main>Put the content cards here.</main>
		</Layout>
	);
}
