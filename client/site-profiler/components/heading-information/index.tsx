import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import StatusCtaInfo from '../heading-information/status-cta-info';
import StatusInfo from '../heading-information/status-info';
import type { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';
import type { SPECIAL_DOMAIN_CATEGORY } from '../../utils/get-domain-category';
import './styles.scss';

interface Props {
	domain: string;
	domainCategory?: SPECIAL_DOMAIN_CATEGORY;
	conversionAction?: CONVERSION_ACTION;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	onCheckAnotherSite?: () => void;
}

export default function HeadingInformation( props: Props ) {
	const { domain, domainCategory, conversionAction, hostingProvider, urlData, onCheckAnotherSite } =
		props;
	const finalStatus = domainCategory ?? conversionAction;

	const recordCtaEvent = ( ctaName: string ) => {
		recordTracksEvent( 'calypso_site_profiler_cta', {
			domain,
			cta_name: ctaName,
			conversion_action: conversionAction,
			domain_category: domainCategory,
		} );
	};

	const onRegisterDomain = () => {
		recordCtaEvent( 'registerDomain' );
		page( `/start/domain/domain-only?new=${ domain }&search=yes` );
	};

	const onTransferDomain = () => {
		recordCtaEvent( 'transferDomain' );
		page( `/setup/domain-transfer/intro?new=${ domain }&search=yes` );
	};

	const onTransferDomainFree = () => {
		recordCtaEvent( 'transferDomainGoogle' );
		page( `/setup/google-transfer/intro?new=${ domain }` );
	};

	const onMigrateSite = () => {
		recordCtaEvent( 'migrateSite' );
		page( `/setup/hosted-site-migration?ref=site-profiler&from=${ domain }` );
	};

	const onLearnMoreHosting = () => {
		recordCtaEvent( 'learnMoreHosting' );
		window.open( 'https://wordpress.com/hosting', '_blank' );
	};

	const onGetWordPress = () => {
		recordCtaEvent( 'getWordpress' );
		window.open( 'https://wordpress.org/download', '_blank' );
	};

	const onLearnMoreAutomattic = () => {
		recordCtaEvent( 'learnMoreAutomattic' );
		window.open( 'https://automattic.com', '_blank' );
	};

	const onJoinTumblr = () => {
		recordCtaEvent( 'joinTumblr' );
		window.open( 'https://tumblr.com/', '_blank' );
	};

	const onLearnMoreGravatar = () => {
		recordCtaEvent( 'learnMoreGravatar' );
		window.open( 'https://gravatar.com/', '_blank' );
	};

	const onGetAkismet = () => {
		recordCtaEvent( 'getAkismet' );
		window.open( 'https://akismet.com/', '_blank' );
	};

	return (
		<div className="heading-information">
			<summary>
				<h5>{ translate( 'Site Profiler' ) }</h5>
				<div className="domain">{ domain }</div>
				<StatusInfo
					conversionAction={ conversionAction }
					hostingProvider={ hostingProvider }
					domainCategory={ domainCategory }
					urlData={ urlData }
				/>
			</summary>
			<footer>
				<StatusCtaInfo conversionAction={ conversionAction } domainCategory={ domainCategory } />
				<div className="cta-wrapper">
					{ ( finalStatus === 'wordpress-com' ||
						finalStatus === 'local-development' ||
						finalStatus === 'wpcom-sp' ||
						finalStatus === 'genaral-a8c-properties' ) && (
						<Button variant="primary" className="button-action" onClick={ onLearnMoreHosting }>
							{ translate( 'Learn more' ) }
						</Button>
					) }
					{ finalStatus === 'wordpress-org' && (
						<Button variant="primary" className="button-action" onClick={ onGetWordPress }>
							{ translate( 'Get WordPress' ) }
						</Button>
					) }
					{ finalStatus === 'automattic-com' && (
						<Button variant="primary" className="button-action" onClick={ onLearnMoreAutomattic }>
							{ translate( 'Learn more' ) }
						</Button>
					) }
					{ finalStatus === 'tumblr-com' && (
						<Button variant="primary" className="button-action" onClick={ onJoinTumblr }>
							{ translate( 'Join Tumblr' ) }
						</Button>
					) }
					{ finalStatus === 'gravatar-com' && (
						<Button variant="primary" className="button-action" onClick={ onLearnMoreGravatar }>
							{ translate( 'Learn more' ) }
						</Button>
					) }
					{ finalStatus === 'akismet-com' && (
						<Button variant="primary" className="button-action" onClick={ onGetAkismet }>
							{ translate( 'Get started with Akismet' ) }
						</Button>
					) }
					{ finalStatus === 'register-domain' && (
						<Button variant="primary" className="button-action" onClick={ onRegisterDomain }>
							{ translate( 'Register domain' ) }
						</Button>
					) }
					{ ( finalStatus === 'transfer-domain' || finalStatus === 'transfer-domain-hosting' ) && (
						<Button variant="primary" className="button-action" onClick={ onTransferDomain }>
							{ translate( 'Transfer domain' ) }
						</Button>
					) }
					{ ( finalStatus === 'transfer-google-domain' ||
						finalStatus === 'transfer-google-domain-hosting' ) && (
						<Button variant="primary" className="button-action" onClick={ onTransferDomainFree }>
							{ translate( 'Transfer domain for free' ) }
						</Button>
					) }
					{ ( finalStatus === 'transfer-hosting' ||
						finalStatus === 'transfer-hosting-wp' ||
						finalStatus === 'transfer-domain-hosting-wp' ||
						finalStatus === 'transfer-google-domain-hosting-wp' ) && (
						<Button variant="primary" className="button-action" onClick={ onMigrateSite }>
							{ translate( 'Migrate site' ) }
						</Button>
					) }

					{ onCheckAnotherSite && (
						<Button variant="link" onClick={ onCheckAnotherSite }>
							{ translate( 'Check another site' ) }
						</Button>
					) }
				</div>
			</footer>
		</div>
	);
}
