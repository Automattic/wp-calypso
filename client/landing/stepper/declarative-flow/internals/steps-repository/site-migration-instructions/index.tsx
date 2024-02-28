import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationInstructions: Step = function () {
	const translate = useTranslate();
	const stepContent = (
		<div>
			<ol>
				<li>
					{ translate( 'Install the {{a}}Migrate Guru plugin{{/a}} on your existing site.', {
						components: {
							a: (
								<a
									href="https://wordpress.org/plugins/migrate-guru/"
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					} ) }
				</li>
				<li>
					{ translate(
						'Click {{strong}}Copy Key{{/strong}} below to get your migration key - you will need that in a few minutes to start the migration.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'Go to the Migrate Guru page on the source site, enter your email address, and click {{strong}}Migrate{{/strong}}.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'You will see a screen showing multiple hosting providers. Select {{em}}Automattic{{/em}} as the destination host.',
						{
							components: {
								em: <em />,
							},
						}
					) }
				</li>
				<li>
					{ translate(
						'Find the {{em}}Migrate Guru Migration Key{{/em}} field, and paste the key you copied in step 2. Then click {{strong}}Migrate{{/strong}} to start your migration.',
						{
							components: {
								em: <em />,
								strong: <strong />,
							},
						}
					) }
				</li>
				<li>{ translate( 'Migrate Guru will send you an email when the migration finishes.' ) }</li>
			</ol>
		</div>
	);

	return (
		<>
			<DocumentHead title="Site migration instructions" />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions"
				hideSkip={ true }
				hideBack={ true }
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText="Site migration instructions"
						align="left"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
