import { Button } from '@wordpress/components';
import page from 'page';
import StatusCtaInfo from '../heading-information/status-cta-info';
import StatusIcon from '../heading-information/status-icon';
import StatusInfo from '../heading-information/status-info';
import type { CONVERSION_ACTION } from '../../hooks/use-define-conversion-action';
import './styles.scss';

interface Props {
	domain: string;
	conversionAction?: CONVERSION_ACTION;
	onCheckAnotherSite?: () => void;
}

export default function HeadingInformation( props: Props ) {
	const { domain, conversionAction, onCheckAnotherSite } = props;

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
				<h5>Who Hosts This Site?</h5>
				<div className="domain">
					<StatusIcon conversionAction={ conversionAction } />
					{ domain }
				</div>
				<StatusInfo conversionAction={ conversionAction } />
			</summary>
			<footer>
				<StatusCtaInfo conversionAction={ conversionAction } />
				<div className="cta-wrapper">
					{ conversionAction === 'register-domain' && (
						<Button className="button-action" onClick={ onRegisterDomain }>
							Register domain
						</Button>
					) }
					{ ( conversionAction === 'transfer-domain' ||
						conversionAction === 'transfer-domain-hosting' ) && (
						<Button className="button-action" onClick={ onTransferDomain }>
							Transfer domain
						</Button>
					) }
					{ conversionAction === 'transfer-google-domain' && (
						<Button className="button-action" onClick={ onTransferDomainFree }>
							Transfer domain for free
						</Button>
					) }
					{ conversionAction === 'transfer-hosting' && (
						<Button className="button-action" onClick={ onMigrateSite }>
							Migrate site
						</Button>
					) }

					{ onCheckAnotherSite && (
						<Button variant="link" onClick={ onCheckAnotherSite }>
							Check another site
						</Button>
					) }
				</div>
			</footer>
		</div>
	);
}
