import { useSiteMigrationKey } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { ClipboardButton } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID;
	const siteMigrationKey = useSiteMigrationKey( siteId );
	const fromUrl = useQuery().get( 'from' ) || '';
	const sourceSiteUrl = fromUrl
		? addQueryArgs( fromUrl + '/wp-admin/admin.php', { page: 'migrateguru' } )
		: '';
	const [ buttonTextCopy, setButtonTextCopy ] = useState( false );
	const onCopy = () => {
		recordTracksEvent( 'calypso_migration_instructions_key_copy' );
		setButtonTextCopy( true );
		setTimeout( () => {
			setButtonTextCopy( false );
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
						<code className="site-migration-instructions__key">
							{ siteMigrationKey.data?.migration_key ?? '' }
						</code>
						<ClipboardButton
							text={ siteMigrationKey.data?.migration_key ?? '' }
							className="site-migration-instructions__copy-key-button is-primary"
							onCopy={ onCopy }
						>
							{ buttonTextCopy ? translate( 'Copied!' ) : translate( 'Copy key' ) }
						</ClipboardButton>
					</div>
				</li>
				<li>
					{ translate(
						'Go to the {{a}}Migrate Guru page on the source site{{/a}}, enter your email address, and click {{strong}}Migrate{{/strong}}.',
						{
							components: {
								a: <a href={ sourceSiteUrl } target="_blank" rel="noreferrer" />,
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
