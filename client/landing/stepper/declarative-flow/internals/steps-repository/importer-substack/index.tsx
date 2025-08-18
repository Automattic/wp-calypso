import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import NewsletterImporter from 'calypso/my-sites/importer/newsletter/importer';
import type { StepId } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

const ImporterSubstack: Step< {
	submits: Record< string, unknown >;
} > = function () {
	const step = useQuery().get( 'step' ) as StepId;
	const siteSlug = useSiteSlug();
	const site = useSite();

	return (
		<NewsletterImporter
			engine="substack"
			siteSlug={ siteSlug }
			step={ step }
			site={ site }
			stepUrlBase="/setup/site-setup/importer-"
		/>
	);
};

export default ImporterSubstack;
