import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import * as components from '../../docs/components/ds/index.mdx';
import * as foundations from '../../docs/foundations/index.mdx';
import * as patterns from '../../docs/patterns/index.mdx';
import { LinkCardListFromMdx } from '../components/link-card-list';
import styles from './index.module.css';

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
	return (
		<Layout>
			<div className={ styles.container }>
				<div className={ styles.content }>
					<HomepageHeader />
					<main>
						{ /* @ts-expect-error - TODO: Fix this */ }
						<LinkCardListFromMdx mdxFiles={ { foundations, patterns, components } } />
					</main>
				</div>
			</div>
		</Layout>
	);
}
