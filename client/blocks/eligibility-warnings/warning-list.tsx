import { Card, Badge } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { Fragment } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import ExternalLink from 'calypso/components/external-link';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( { context, translate, warnings, showContact = true }: Props ) => {
	const hasEnTranslation = useHasEnTranslation();
	return (
		<div>
			{ getWarningDescription( context, warnings.length, translate, hasEnTranslation ) && (
				<div className="eligibility-warnings__warning">
					<div className="eligibility-warnings__message">
						<span className="eligibility-warnings__message-description">
							{ getWarningDescription( context, warnings.length, translate, hasEnTranslation ) }
						</span>
					</div>
				</div>
			) }

			{ warnings.map( ( { name, description, supportUrl, domainNames }, index ) => (
				<div className="eligibility-warnings__warning" key={ index }>
					<div className="eligibility-warnings__message">
						{ context !== 'plugin-details' && (
							<Fragment>
								<span className="eligibility-warnings__message-title">{ name }</span>:&nbsp;
							</Fragment>
						) }
						<span className="eligibility-warnings__message-description">
							<span>{ description } </span>
							{ domainNames && displayDomainNames( domainNames ) }
							{ supportUrl && (
								<ExternalLink href={ supportUrl } target="_blank" rel="noopener noreferrer">
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
				<span>{ domainNames.current }</span>
				<Badge type="info">{ translate( 'current' ) }</Badge>
			</Card>
			<Card compact>
				<span>{ domainNames.new }</span>
				<Badge type="success">{ translate( 'new' ) }</Badge>
			</Card>
		</div>
	);
}

function getWarningDescription(
	context: string | null,
	warningCount: number,
	translate: LocalizeProps[ 'translate' ],
	hasTranslation: ( arg: string ) => boolean
) {
	const defaultCopy = translate(
		'By proceeding the following change will be made to the site:',
		'By proceeding the following changes will be made to the site:',
		{
			count: warningCount,
			args: warningCount,
		}
	);
	switch ( context ) {
		case 'plugin-details':
		case 'plugins':
			return '';

		case 'themes':
			return translate(
				'By installing a theme the following change will be made to the site:',
				'By installing a theme the following changes will be made to the site:',
				{
					count: warningCount,
					args: warningCount,
				}
			);

		case 'hosting':
			return translate(
				'By activating hosting access the following change will be made to the site:',
				'By activating hosting access the following changes will be made to the site:',
				{
					count: warningCount,
					args: warningCount,
				}
			);

		case 'hosting-features':
			return hasTranslation(
				'By activating all hosting features the following change will be made to the site:'
			)
				? translate(
						'By activating all hosting features the following change will be made to the site:',
						'By activating all hosting features the following changes will be made to the site:',
						{
							count: warningCount,
							args: warningCount,
						}
				  )
				: translate(
						'By activating all developer tools the following change will be made to the site:',
						'By activating all developer tools the following changes will be made to the site:',
						{
							count: warningCount,
							args: warningCount,
						}
				  );

		default:
			return defaultCopy;
	}
}

export default localize( WarningList );
