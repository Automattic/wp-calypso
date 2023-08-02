import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { getSiteDomain, getSiteTitle } from 'calypso/state/sites/selectors';
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

const EnabledSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const username = useSelector( getCurrentUserName );
	const catchallAlias = `${ domain }@${ domain }`;
	const userAlias = `${ username }@${ domain }`;

	// todo: only show the user alias when the blog has > 1 user, and/or is upgraded.
	// todo: warnings for non-custom domains
	return (
		<Card className="site-settings__card">
			<p>
				Lots of cool customizations and bonus features coming soon with WordPress.com Premium and
				up!
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

function useDispatchSuccessNotice() {
	const dispatch = useDispatch();
	return ( message ) => dispatch( successNotice( message ) );
}

export const WpcomFediverseSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const { isEnabled, setEnabled, isLoading, isError } = useActivityPubStatus( siteId );
	const disabled = isLoading || isError;
	const dispatchSuccessNotice = useDispatchSuccessNotice();
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, siteId ) );
	const noticeArgs = {
		args: {
			site_title: siteTitle,
		},
	};

	const onChange = async () => {
		// Setting the message before the update so the message seems counterintuitive.
		const message = ! isEnabled
			? translate( '%(site_title)s has entered the fediverse!', noticeArgs )
			: translate( '%(site_title)s has exited the fediverse.', noticeArgs );

		await setEnabled( ! isEnabled );
		dispatchSuccessNotice( message, { duration: 3333 } );
	};
	return (
		<>
			<Card className="site-settings__card">
				<p>
					The fediverse is a network of social media sites like Mastodon and Pixelfed and Firefish
					and Peertube and Pleroma, oh my!
				</p>
				<p>
					Your site can publish to the same ActivityPub protocol that powers all of them, just
					enable:
				</p>
				<ToggleControl
					label={ translate( 'Enter the fediverse' ) }
					disabled={ disabled }
					checked={ isEnabled }
					onChange={ onChange }
				/>
			</Card>
			{ isEnabled && <EnabledSettingsSection siteId={ siteId } /> }
		</>
	);
};
