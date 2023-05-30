import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { useActivityPubStatus } from './hooks';

const CopyButton = ( { alias } ) => {
	const translate = useTranslate();
	const [ isCopied, setIsCopied ] = useState( false );
	const text = isCopied ? translate( '✅ Copied!' ) : <code>{ alias }</code>;
	const onCopy = () => {
		setIsCopied( true );
		setTimeout( () => setIsCopied( false ), 3333 );
	};

	return (
		<ClipboardButton text={ alias } onCopy={ onCopy }>
			{ text }
		</ClipboardButton>
	);
};

const EnabledSettingsSection = ( { error, siteId } ) => {
	const translate = useTranslate();
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const username = useSelector( getCurrentUserName );
	const catchallAlias = `${ domain }@${ domain }`;
	const userAlias = `${ username }@${ domain }`;

	// todo: only show the user alias when the blog has > 1 user, and/or is upgraded.
	// todo: warnings for non-custom domains
	return (
		<Card className="site-settings__card">
			{ error && (
				<p>
					<strong>
						{ translate(
							'This section will only appear once the toggle is enabled (not yet working)'
						) }
					</strong>
				</p>
			) }
			<p>
				{ translate(
					'Lots of cool customizations and bonus features coming soon with WordPress.com Premium and up!'
				) }
			</p>
			<hr />
			<p>{ translate( 'The fediverse can follow your site with this alias:' ) }</p>
			<p>
				<CopyButton alias={ catchallAlias } />
			</p>
			<p>Upgraded sites will receive an option for user-based aliases</p>
			<p>
				<CopyButton alias={ userAlias } />
			</p>
		</Card>
	);
};

export const WpcomFediverseSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const { isEnabled, setEnabled, isLoading, isError } = useActivityPubStatus( siteId );
	const disabled = isLoading || isError;
	return (
		<>
			<SettingsSectionHeader title={ translate( 'Fediverse settings' ) } />
			<Card className="site-settings__card">
				<p>
					{ translate(
						'The fediverse is a network of social media sites like Mastodon and Pixelfed and Calckey and Peertube and Pleroma, oh my!'
					) }
				</p>
				<p>
					{ translate(
						'Your site can publish to the same ActivityPub protocol that powers all of them, just enable:'
					) }
				</p>
				<ToggleControl
					label={ translate( 'Enter the fediverse' ) }
					disabled={ disabled }
					checked={ isEnabled }
					onChange={ () => setEnabled( ! isEnabled ) }
				/>
			</Card>
			{ ( isEnabled /* get rid of isError once the endpoint lands */ || isError ) && (
				<EnabledSettingsSection error={ isError } siteId={ siteId } />
			) }
		</>
	);
};
