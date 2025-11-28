import { useHasEnTranslation } from '@automattic/i18n-utils';
import { globe, group, scheduled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChecklistCard } from 'calypso/landing/stepper/declarative-flow/internals/components/checklist-card';
import CancelDifmMigrationForm from './cancel-difm-migration';
import { Container, Header } from './layout';
import type { SiteDetails } from '@automattic/data-stores';

export const MigrationStartedDIFM = ( { site }: { site: SiteDetails } ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const title = translate( "We've received your migration request" );
	const subTitle = hasEnTranslation(
		"We will review your site to make sure we have everything we need. Here's what you can expect next:"
	)
		? translate(
				"We will review your site to make sure we have everything we need. Here's what you can expect next:"
		  )
		: translate(
				"Our team has received your details. We will review your site to make sure we have everything we need. Here's what you can expect next:"
		  );

	const checklistItems = [
		{
			icon: group,
			text: translate(
				"We'll bring over a copy of your site, without affecting the current live version."
			),
		},
		{
			icon: scheduled,
			text: translate(
				"You'll get an update on the progress of your migration within 2-3 business days."
			),
		},
		{
			icon: globe,
			text: translate( "We'll help you switch your domain over after the migration's completed." ),
		},
	];

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-started-difm">
				<div className="migration-started-difm__checklist">
					<ChecklistCard title={ translate( 'What to expect' ) } items={ checklistItems } />
				</div>
				<CancelDifmMigrationForm siteId={ site.ID } />
			</div>
		</Container>
	);
};
