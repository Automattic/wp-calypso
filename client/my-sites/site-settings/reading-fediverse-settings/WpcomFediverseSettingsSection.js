import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import { successNotice } from 'calypso/state/notices/actions';
import { getSiteTitle, getSiteDomain } from 'calypso/state/sites/selectors';
import { useActivityPubStatus } from './hooks';

const DomainUpsellCard = ( { siteId } ) => {
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const linkUrl = domainAddNew( domain );
	return (
		<Card className="site-settings__card">
			<code>{ '<blink>' }</code>
			<a href={ linkUrl }>
				Link to Domain Upsell, with tracking and return path, needs moar design.
			</a>
			<code>{ '</blink>' }</code>
		</Card>
	);
};

const DomainCongratsCard = ( { user } ) => {
	const translate = useTranslate();
	return (
		<Card className="site-settings__card">
			{ translate(
				'Your site is using a custom domain! You can now set up a custom ActivityPub alias.'
			) }
			<ClipboardButtonInput value={ user } />
		</Card>
	);
};

const EnabledSettingsSection = ( { data, siteId } ) => {
	const translate = useTranslate();
	const { blogIdentifier = '', userIdentifier } = data;

	return (
		<>
			{ ! data.userIdentifier && <DomainUpsellCard siteId={ siteId } /> }
			<Card className="site-settings__card">
				<p>{ translate( 'Anyone in the fediverse can follow your site with this alias:' ) }</p>
				<p>
					<ClipboardButtonInput value={ blogIdentifier } />
				</p>
			</Card>
			{ data.userIdentifier && <DomainCongratsCard user={ userIdentifier } /> }
		</>
	);
};

function useDispatchSuccessNotice() {
	const dispatch = useDispatch();
	return ( message ) => dispatch( successNotice( message, { duration: 3333 } ) );
}

export const WpcomFediverseSettingsSection = ( { siteId } ) => {
	const translate = useTranslate();
	const dispatchSuccessNotice = useDispatchSuccessNotice();
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, siteId ) );
	const noticeArgs = {
		args: {
			site_title: siteTitle,
		},
	};
	const { isEnabled, setEnabled, isLoading, isError, data } = useActivityPubStatus(
		siteId,
		( response ) => {
			const message = response.enabled
				? translate( '%(site_title)s has entered the fediverse!', noticeArgs )
				: translate( '%(site_title)s has exited the fediverse.', noticeArgs );
			dispatchSuccessNotice( message );
		}
	);
	const disabled = isLoading || isError;

	return (
		<>
			<Card className="site-settings__card">
				<p>
					{ translate(
						'With ActivityPub your blog becomes part of a federated social network. This means you can share and talk to everyone using the ActivityPub protocol, including users of Mastodon, Friendica, and Pleroma.'
					) }
				</p>
				<p>
					{ translate(
						'Allow people on the fediverse to follow your site, receive updates, and leave comments.'
					) }
				</p>
				<ToggleControl
					label={ translate( 'Enter the fediverse' ) }
					disabled={ disabled }
					checked={ isEnabled }
					onChange={ ( value ) => setEnabled( value ) }
				/>
			</Card>
			{ isEnabled && <EnabledSettingsSection data={ data } siteId={ siteId } /> }
		</>
	);
};
