import { StepContainer } from '@automattic/onboarding';
import { ClipboardButton } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const translate = useTranslate();
	const siteMigrationKey = 'Yjx3xUYYTm89s9xBFe7jitNA94noUg6tzgjnpx9zPVwGdbewfL';
	const buttonTextCopy = translate( 'Copy key' );
	const [ buttonText, setButtonText ] = useState( buttonTextCopy );
	const onCopy = () => {
		recordTracksEvent( 'calypso_migration_instructions_key_copy' );
		setButtonText( translate( 'Copied!' ) );
		setTimeout( () => {
			setButtonText( buttonTextCopy );
		}, 2000 );
	};

	const stepContent = (
		<div>
			<ol className="site-migration-instructions__list">
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
						'Click {{strong}}Copy key{{/strong}} below to get your migration key - you will need that in a few minutes to start the migration.',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
					<div className="site-migration-instructions__migration-key">
						<code className="site-migration-instructions__key">{ siteMigrationKey }</code>
						<ClipboardButton
							text={ siteMigrationKey }
							className="site-migration-instructions__copy-key-button is-primary"
							onCopy={ onCopy }
						>
							{ buttonText }
						</ClipboardButton>
					</div>
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
			<DocumentHead title={ translate( 'Migrate your site' ) } />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions"
				hideSkip={ true }
				hideBack={ true }
				isHorizontalLayout={ true }
				formattedHeader={
					<>
						<FormattedHeader
							id="site-migration-instructions-header"
							headerText={ translate( 'Migrate your site' ) }
							align="left"
						/>
						<p>
							{ translate(
								'Move your existing WordPress site to WordPress.com. Follow these steps to get started.'
							) }
						</p>
					</>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
