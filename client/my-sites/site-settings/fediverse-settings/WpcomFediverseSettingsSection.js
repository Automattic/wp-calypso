import { Card, Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import { Notice } from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import { useActivityPubStatus } from 'calypso/state/activitypub/use-activitypub-status';
import { successNotice } from 'calypso/state/notices/actions';
import { getSiteTitle, getSiteDomain, getSite } from 'calypso/state/sites/selectors';

const DomainUpsellCard = ( { siteId } ) => {
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const linkUrl = addQueryArgs( domainAddNew( domain ), {
		domainAndPlanPackage: 'true',
		upsell: 'activitypub',
	} );
	const translate = useTranslate();
	const recordClick = () => {
		recordTracksEvent( 'calypso_activitypub_domain_upsell_click' );
	};
	return (
		<Card className="site-settings__card">
			<p>
				{ translate(
					'Unlock the full power of the fediverse with a memorable custom domain. Your domain also means that you can take your followers with you, using self-hosted WordPress with the ActivityPub plugin, or any other ActivityPub software.'
				) }
			</p>
			<Button primary href={ linkUrl } onClick={ recordClick }>
				{ translate( 'Add a custom domain' ) }
			</Button>
		</Card>
	);
};

const DomainPendingWarning = ( { siteId } ) => {
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const translate = useTranslate();
	return (
		<Notice status="is-warning" translate={ translate } isCompact={ true }>
			{ translate(
				'Recommended: wait until your new domain activates before sharing your profile URL. {{link}}Click here{{/link}} to check the status of your domain.',
				{
					components: {
						link: <a href={ `/domains/manage/${ domain }` } />,
					},
				}
			) }
		</Notice>
	);
};

const DomainCongratsCard = ( { user, isPending, siteId } ) => {
	const translate = useTranslate();
	return (
		<Card className="site-settings__card">
			<p>{ translate( 'Your site is using a custom domain! 🎉' ) }</p>
			<p>
				{ translate(
					'Owning your domain unlocks account portability and a separate profile for each blog author. Here’s yours:'
				) }
			</p>
			{ isPending && <DomainPendingWarning siteId={ siteId } /> }
			<p>
				<ClipboardButtonInput value={ user } />
			</p>
		</Card>
	);
};

const EnabledSettingsSection = ( { data, siteId } ) => {
	const translate = useTranslate();
	const { blogIdentifier = '', userIdentifier } = data;
	const hasDomain = !! userIdentifier;
	// if the domain has been purchased, but isn't active yet because the site is still using *.wordpress.com
	const isDomainPending = hasDomain && userIdentifier.match( /\.wordpress\.com$/ );

	return (
		<>
			{ ! hasDomain && <DomainUpsellCard siteId={ siteId } /> }
			<Card className="site-settings__card">
				<p>{ translate( 'Anyone in the fediverse can follow your site with this alias:' ) }</p>
				{ isDomainPending && <DomainPendingWarning siteId={ siteId } /> }
				<p>
					<ClipboardButtonInput value={ blogIdentifier } />
				</p>
			</Card>
			{ hasDomain && (
				<DomainCongratsCard
					user={ userIdentifier }
					isPending={ isDomainPending }
					siteId={ siteId }
				/>
			) }
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
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const isPrivate = site?.is_private || site?.is_coming_soon;
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
	const disabled = isLoading || isError || isPrivate;
	return (
		<>
			<Card className="site-settings__card">
				<p>
					{ translate(
						'Broadcast your blog into the fediverse! Attract followers, deliver updates, and receive comments from a diverse user base of ActivityPub-compliant platforms.'
					) }
				</p>
				<ToggleControl
					label={ translate( 'Enter the fediverse' ) }
					disabled={ disabled }
					checked={ isEnabled }
					onChange={ ( value ) => setEnabled( value ) }
				/>
				{ isPrivate && (
					<Notice status="is-warning" translate={ translate } isCompact={ true }>
						{ translate(
							'You cannot enter the fediverse until your site is publicly launched. {{link}}Review Privacy settings{{/link}}.',
							{
								components: {
									link: <a href={ `/settings/general/${ domain }` } />,
								},
							}
						) }
					</Notice>
				) }
			</Card>
			{ isEnabled && <EnabledSettingsSection data={ data } siteId={ siteId } /> }
		</>
	);
};
