import { Card, Badge } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import DOMPurify from 'dompurify';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { Fragment } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

export type AtomicTransferAction = 'hosting-features' | 'themes' | 'plugins' | 'scan' | 'backup';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
	transferAction?: AtomicTransferAction;
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( {
	context,
	translate,
	warnings,
	showContact = true,
	transferAction,
}: Props ) => {
	const transferIntro = getAtomicTransferIntro( transferAction, translate );

	return (
		<div>
			{ transferIntro && (
				<div className="eligibility-warnings__warning eligibility-warnings__intro">
					<div className="eligibility-warnings__message">
						<span className="eligibility-warnings__message-description">{ transferIntro }</span>
					</div>
				</div>
			) }
			{ warnings.map( ( { name, description, supportPostId, supportUrl, domainNames }, index ) => (
				<div className="eligibility-warnings__warning" key={ index }>
					<div className="eligibility-warnings__message">
						{ ! domainNames && context !== 'plugin-details' && context !== 'hosting-features' && (
							<Fragment>
								<span className="eligibility-warnings__message-title">{ name }</span>:&nbsp;
							</Fragment>
						) }
						<span className="eligibility-warnings__message-description">
							{ domainNames ? (
								<>
									{ translate(
										'{{strong}}Your site’s address will change{{/strong}} to the one below. Links to your old address will redirect automatically.',
										{ components: { strong: <strong /> } }
									) }{ ' ' }
									<InlineSupportLink
										supportPostId={ 11280 }
										showIcon={ false }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/changing-site-address/#change-a-wpcomstaging-com-address'
										) }
									>
										{ translate( 'Learn more' ) }
									</InlineSupportLink>
									.{ displayDomainNames( domainNames ) }
								</>
							) : (
								<>
									<span
										dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( description ) } } // eslint-disable-line react/no-danger
									/>
									{ supportUrl && (
										<>
											{ ' ' }
											<InlineSupportLink
												supportLink={ supportUrl }
												supportPostId={ supportPostId }
												showIcon={ false }
											>
												{ translate( 'Learn more' ) }
											</InlineSupportLink>{ ' ' }
											<span className="eligibility-warnings__external-arrow">↗</span>.
										</>
									) }
								</>
							) }
						</span>
					</div>
				</div>
			) ) }

			{ showContact && (
				<div className="eligibility-warnings__warning">
					<div className="eligibility-warnings__message">
						<span className="eligibility-warnings__message-description">
							{ translate( '{{a}}Contact support{{/a}} for help and questions.', {
								components: {
									a: <ActionPanelLink href="/help/contact" />,
								},
							} ) }
						</span>
					</div>
				</div>
			) }
		</div>
	);
};

function getAtomicTransferIntro(
	transferAction: AtomicTransferAction | undefined,
	translate: LocalizeProps[ 'translate' ]
) {
	switch ( transferAction ) {
		case 'hosting-features':
			return translate(
				'To turn hosting features on, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			);
		case 'themes':
			return translate(
				'To upload themes, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			);
		case 'plugins':
			return translate(
				'To install plugins, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			);
		case 'scan':
			return translate(
				'To turn Jetpack Scan on, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			);
		case 'backup':
			return translate(
				'To turn Jetpack VaultPress Backup on, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			);
		default:
			return null;
	}
}

function displayDomainNames( domainNames: DomainNames ) {
	//Split out the first part of the domain names and then join the rest back together.
	const domainNamesArrayCurrent = domainNames.current.split( '.' );
	const domainNamesArrayNew = domainNames.new.split( '.' );
	const firstPartCurrent = domainNamesArrayCurrent.shift();
	const firstPartNew = domainNamesArrayNew.shift();
	const secondPartCurrent = '.' + domainNamesArrayCurrent.join( '.' );
	const secondPartNew = '.' + domainNamesArrayNew.join( '.' );

	return (
		<div className="eligibility-warnings__domain-names">
			<Card compact>
				<span className="eligibility-warnings__address">
					<span className="eligibility-warnings__address-first">{ firstPartCurrent }</span>
					<span className="eligibility-warnings__address-second">{ secondPartCurrent }</span>
				</span>
				<Badge type="info">{ translate( 'current' ) }</Badge>
			</Card>
			<Card compact>
				<span className="eligibility-warnings__address">
					<span className="eligibility-warnings__address-first">{ firstPartNew }</span>
					<span className="eligibility-warnings__address-second">{ secondPartNew }</span>
				</span>
				<Badge type="success">{ translate( 'new' ) }</Badge>
			</Card>
		</div>
	);
}

export default localize( WarningList );
