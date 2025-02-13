import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useSiteDomains from 'calypso/my-sites/checkout/src/hooks/use-site-domains.ts';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import { useActivityPubStatus } from 'calypso/state/activitypub/use-activitypub-status';
import { successNotice } from 'calypso/state/notices/actions';
import {
	getSiteTitle,
	getSiteDomain,
	getSite,
	getSitePlanSlug,
} from 'calypso/state/sites/selectors';

const DomainUpsellCard = ( { siteId } ) => {
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const linkUrl = addQueryArgs( domainAddNew( domain ), {
		domainAndPlanPackage: 'true',
		upsell: 'activitypub',
	} );
	const translate = useTranslate();
	const recordClick = () => {
		const domainRegExp = new RegExp( `/${ domain }$` );
		const currentRoute = window.location.pathname.replace( domainRegExp, '' ).split( '/' ).pop();
		recordTracksEvent( 'calypso_activitypub_domain_upsell_click', { route: currentRoute } );
	};
	return (
		<div>
			<p>
				{ translate(
					'Unlock the full power of the fediverse with a memorable custom domain. Your domain also means that you can take your followers with you, using self-hosted WordPress with the ActivityPub plugin, or any other ActivityPub software.'
				) }
			</p>
			<Button primary href={ linkUrl } onClick={ recordClick }>
				{ translate( 'Add a custom domain' ) }
			</Button>
		</div>
	);
};

const hasNewDomain = ( domains ) => {
	const now = new Date();
	const oneHour = 60 * 60 * 1000;
	let newDomain = false;
	domains.forEach( ( domain ) => {
		if ( domain.isWPCOMDomain ) {
			return;
		}
		const registrationDate = new Date( domain.registrationDate );
		const hourAgo = new Date( now.getTime() - oneHour );
		if ( registrationDate >= hourAgo && registrationDate <= now ) {
			newDomain = true;
		}
	} );
	return newDomain;
};

const DomainPendingWarning = ( { siteId, domains } ) => {
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const translate = useTranslate();
	const hasNew = hasNewDomain( domains );
	const translateArgs = {
		components: {
			link: <a href={ `/domains/manage/${ domain }` } />,
		},
	};
	const message = hasNew
		? translate(
				'Wait until your new domain activates before sharing your profile. {{link}}Check your domain’s status{{/link}}.',
				translateArgs
		  )
		: translate(
				'You’ve added a domain, but it’s not primary. To make it primary, {{link}}manage your domains{{/link}}.',
				translateArgs
		  );

	return (
		<Notice status="is-warning" isCompact className="is-full-width">
			{ message }
		</Notice>
	);
};

const BusinessPlanUpsellCard = ( { siteId } ) => {
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ?? '' );
	// If the user is already on Atomic, we'll be in `JetpackFediverseSettingsSection` instead.
	// But they could have purchased the upgrade and not have transferred yet.
	const isBusinessPlan = sitePlanSlug === PLAN_BUSINESS;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const linkUrl = `/plans/select/business/${ domain }`;
	const translate = useTranslate();
	const recordClick = () => {
		const domainRegExp = new RegExp( `/${ domain }$` );
		const currentRoute = window.location.pathname.replace( domainRegExp, '' ).split( '/' ).pop();
		recordTracksEvent( 'calypso_activitypub_business_plan_upsell_click', { route: currentRoute } );
	};
	const planName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
	if ( isBusinessPlan ) {
		// show a card that links to the plugin page to install the ActivityPub plugin
		return (
			<div>
				<p>
					{ translate(
						'Install the ActivityPub plugin to unlock per-author profiles, fine-grained controls, and more.'
					) }
				</p>
				<Button primary href={ `/plugins/activitypub/${ domain }` }>
					{ translate( 'Install ActivityPub plugin' ) }
				</Button>
			</div>
		);
	}
	return (
		<div>
			<p>
				{ translate(
					// Translators: %(planName)s is the name of a plan, eg "Business" or "Creator"
					'Take your fediverse presence to the next level! The %(planName)s plan unlocks per-author profiles, fine-grained controls, and more, with the ActivityPub plugin.',
					{ args: { planName } }
				) }
			</p>
			<Button primary href={ linkUrl } onClick={ recordClick }>
				{ translate( 'Upgrade to %(planName)s', { args: { planName } } ) }
			</Button>
		</div>
	);
};

const hasPendingDomain = ( domains ) => {
	let pendingDomain = false;
	domains.forEach( ( domain ) => {
		// if the domain is a WPCOM domain and is not the primary domain, it's not pending
		if ( domain.isWPCOMDomain && domain.isPrimary ) {
			pendingDomain = true;
		}
	} );
	return pendingDomain;
};

const EnabledSettingsSection = ( { data, siteId } ) => {
	const translate = useTranslate();
	const domains = useSiteDomains( siteId );
	const { blogIdentifier = '' } = data;
	const hasDomain = domains?.length > 1;
	// if the domain has been purchased, but isn't active yet because the site is still using *.wordpress.com
	const isDomainPending = hasDomain && hasPendingDomain( domains );

	return (
		<>
			{ ! hasDomain && <DomainUpsellCard siteId={ siteId } /> }
			<div className="fediverse-settings-wrapper">
				<p>
					{ translate(
						'People on the Fediverse (such as on Mastodon) can follow your site using this identifier:'
					) }
				</p>
				{ isDomainPending && <DomainPendingWarning siteId={ siteId } domains={ domains } /> }
				<p>
					<ClipboardButtonInput value={ blogIdentifier } />
				</p>
			</div>
			{ hasDomain && ! isDomainPending && <BusinessPlanUpsellCard siteId={ siteId } /> }
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
	const baseSettingsLink = `/settings/general/${ domain }#site-privacy-settings`;
	const settingsLink = isJetpackCloud()
		? `https://wordpress.com${ baseSettingsLink }`
		: baseSettingsLink;
	return (
		<>
			<div className="fediverse-settings-wrapper">
				<p>
					{ translate(
						'Broadcast your blog into the fediverse! Attract followers, deliver updates, and receive comments from a diverse user base of ActivityPub-compliant platforms like {{b}}Mastodon{{/b}}.',
						{
							components: {
								b: <strong />,
							},
						}
					) }
				</p>
				<ToggleControl
					label={ translate( 'Enter the fediverse' ) }
					disabled={ disabled }
					checked={ isEnabled }
					onChange={ ( value ) => setEnabled( value ) }
				/>
				{ isPrivate && (
					<Notice status="is-warning" translate={ translate } isCompact>
						{ translate( '{{link}}Launch your site{{/link}} to enter the fediverse!', {
							components: {
								link: <a href={ settingsLink } />,
							},
						} ) }
					</Notice>
				) }
			</div>
			{ isEnabled && <EnabledSettingsSection data={ data } siteId={ siteId } /> }
		</>
	);
};
