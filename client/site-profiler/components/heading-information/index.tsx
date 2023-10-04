import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import page from 'page';
import { UrlData } from 'calypso/blocks/import/types';
import { HostingProvider } from 'calypso/data/site-profiler/types';
import StatusCtaInfo from '../heading-information/status-cta-info';
import StatusInfo from '../heading-information/status-info';
import type { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';
import './styles.scss';

interface Props {
	domain: string;
	conversionAction?: CONVERSION_ACTION;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	onCheckAnotherSite?: () => void;
}

export default function HeadingInformation( props: Props ) {
	const { domain, conversionAction, hostingProvider, urlData, onCheckAnotherSite } = props;

	const onRegisterDomain = () => {
		page( `/start/domain/domain-only?new=${ domain }&search=yes` );
	};

	const onTransferDomain = () => {
		page( `/setup/domain-transfer/intro?new=${ domain }&search=yes` );
	};

	const onMigrateSite = () => {
		page( `/setup/import-hosted-site?from=${ domain }` );
	};

	const onTransferDomainFree = () => {
		page( `/setup/google-transfer/intro?new=${ domain }` );
	};

	return (
		<div className="heading-information">
			<summary>
				<h5>{ translate( 'Site Profiler' ) }</h5>
				<div className="domain">{ domain }</div>
				<StatusInfo
					conversionAction={ conversionAction }
					hostingProvider={ hostingProvider }
					urlData={ urlData }
				/>
			</summary>
			<footer>
				<StatusCtaInfo conversionAction={ conversionAction } />
				<div className="cta-wrapper">
					{ conversionAction === 'register-domain' && (
						<Button className="button-action" onClick={ onRegisterDomain }>
							{ translate( 'Register domain' ) }
						</Button>
					) }
					{ ( conversionAction === 'transfer-domain' ||
						conversionAction === 'transfer-domain-hosting' ) && (
						<Button className="button-action" onClick={ onTransferDomain }>
							{ translate( 'Transfer domain' ) }
						</Button>
					) }
					{ ( conversionAction === 'transfer-google-domain' ||
						conversionAction === 'transfer-google-domain-hosting' ) && (
						<Button className="button-action" onClick={ onTransferDomainFree }>
							{ translate( 'Transfer domain for free' ) }
						</Button>
					) }
					{ ( conversionAction === 'transfer-hosting' ||
						conversionAction === 'transfer-hosting-wp' ||
						conversionAction === 'transfer-domain-hosting-wp' ||
						conversionAction === 'transfer-google-domain-hosting-wp' ) && (
						<Button className="button-action" onClick={ onMigrateSite }>
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
