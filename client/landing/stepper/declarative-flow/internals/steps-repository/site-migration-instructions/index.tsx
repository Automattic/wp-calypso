import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { ClipboardButton } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID;
	const fromUrl = useQuery().get( 'from' ) || '';
	const sourceSiteUrl = fromUrl
		? addQueryArgs( fromUrl + '/wp-admin/admin.php', { page: 'migrateguru' } )
		: '';
	const destSiteUrl = fromUrl
		? addQueryArgs( site?.URL + '/wp-admin/admin.php', { page: 'migrateguru' } )
		: '';
	const [ buttonTextCopy, setButtonTextCopy ] = useState( false );
	const onCopy = () => {
		recordTracksEvent( 'calypso_migration_instructions_key_copy' );
		setButtonTextCopy( true );
		setTimeout( () => {
			setButtonTextCopy( false );
		}, 2000 );
	};
	const [ siteMigrationKey, setSiteMigrationKey ] = useState< string | null >( null );
	const [ siteMigrationKeyError, setSiteMigrationKeyError ] = useState< string | null >( null );
	const [ hideSiteMigrationKey, setHideSiteMigrationKey ] = useState( true );

	const getMigrationKey = async () => {
		try {
			const response = await wpcom.req.get(
				`/sites/${ siteId }/atomic-migration-status/migrate-guru-key?http_envelope=1`,
				{
					apiNamespace: 'wpcom/v2',
				}
			);

			setSiteMigrationKey( response?.migration_key );
			recordTracksEvent( 'calypso_migration_instructions_key_retrieved' );
		} catch ( error ) {
			setSiteMigrationKeyError( error as string );
			recordTracksEvent( 'calypso_migration_instructions_key_error' );
		}
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
					<div
						className={ classNames( 'site-migration-instructions__list-migration-key-item', {
							expanded: siteMigrationKey,
							error: siteMigrationKeyError,
						} ) }
					>
						{ ! siteMigrationKey && (
							<>
								{ ! siteMigrationKeyError && (
									<Button
										primary
										compact
										className="site-migration-instructions__get-key-button component-button"
										onClick={ getMigrationKey }
									>
										{ translate( 'Get migration key', {
											components: {
												strong: <strong />,
											},
										} ) }
									</Button>
								) }
								{ siteMigrationKeyError && (
									<>
										{ translate(
											'We were unable to retrieve your migration key. To get the key manually, go to the {{a}}Migrate Guru page on the new WordPress.com site{{/a}}.',
											{
												components: {
													a: <a href={ destSiteUrl } target="_blank" rel="noreferrer" />,
												},
											}
										) }
									</>
								) }
							</>
						) }
						{ siteMigrationKey && ! siteMigrationKeyError && (
							<>
								{ translate(
									'Click {{strong}}Copy key{{/strong}} below to copy your migration key - you will need that in a few minutes to start the migration. This key is unique to your site and will only be available once.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
								<div className="site-migration-instructions__migration-key">
									<code className="site-migration-instructions__key">
										{ hideSiteMigrationKey
											? '*'.repeat( siteMigrationKey.length - 5 )
											: siteMigrationKey }
									</code>
									<Button
										onClick={ () => {
											setHideSiteMigrationKey( ! hideSiteMigrationKey );
										} }
										className="site-migration-instructions__show-key-button components-button"
									>
										{ hideSiteMigrationKey ? translate( 'Show key' ) : translate( 'Hide key' ) }
									</Button>
									<ClipboardButton
										text={ siteMigrationKey }
										className="site-migration-instructions__copy-key-button is-secondary"
										onCopy={ onCopy }
									>
										{ buttonTextCopy ? translate( 'Copied!' ) : translate( 'Copy key' ) }
									</ClipboardButton>
								</div>
							</>
						) }
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
				formattedHeader={
					<>
						<FormattedHeader
							id="site-migration-instructions-header"
							headerText={ translate( 'Ready to migrate your site?' ) }
							align="center"
						/>
						<p>{ translate( 'Follow these steps to get started.' ) }</p>
					</>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
