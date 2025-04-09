import { Card, Badge, ExternalLink } from '@automattic/components';
import DOMPurify from 'dompurify';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { Fragment } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
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
			{ warnings.map( ( { name, description, supportUrl, domainNames }, index ) => (
				<div className="eligibility-warnings__warning" key={ index }>
					<div className="eligibility-warnings__message">
						{ context !== 'plugin-details' && context !== 'hosting-features' && (
							<Fragment>
								<span className="eligibility-warnings__message-title">{ name }</span>:&nbsp;
							</Fragment>
						) }
						<span className="eligibility-warnings__message-description">
							<span
								dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( description ) } } // eslint-disable-line react/no-danger
							/>
							{ domainNames && displayDomainNames( domainNames ) }
							{ supportUrl && (
								<ExternalLink href={ supportUrl } target="_blank">
									{ translate( 'Learn more.' ) }
								</ExternalLink>
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
	return (
		<div className="eligibility-warnings__domain-names">
			<Card compact>
				<span className="eligibility-warnings__address">{ domainNames.current }</span>
				<Badge type="info">{ translate( 'current' ) }</Badge>
			</Card>
			<Card compact>
				<span className="eligibility-warnings__address">{ domainNames.new }</span>
				<Badge type="success">{ translate( 'new' ) }</Badge>
			</Card>
		</div>
	);
}

export default localize( WarningList );
