import { Card, Badge } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import DOMPurify from 'dompurify';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { Fragment } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( { context, translate, warnings, showContact = true }: Props ) => {
	return (
		<div>
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
										'Turning on this feature will update {{strong}}your site’s default address by changing the subdomain{{/strong}}. We’ll automatically redirect visitors from the current address to the new one.',
										{ components: { strong: <strong /> } }
									) }{ ' ' }
									<InlineSupportLink
										supportPostId={ 11280 }
										showIcon={ false }
										supportLink={ localizeUrl(
											'https://wordpress.com/support/changing-site-address/#change-a-wpcomstaging-com-address'
										) }
									>
										{ translate( 'Learn more.' ) }
									</InlineSupportLink>
									{ displayDomainNames( domainNames ) }
								</>
							) : (
								<>
									<span
										dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( description ) } } // eslint-disable-line react/no-danger
									/>
									{ supportUrl && (
										<InlineSupportLink supportLink={ supportUrl } supportPostId={ supportPostId }>
											{ translate( 'Learn more.' ) }
										</InlineSupportLink>
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
