import { Card } from '@automattic/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import { map } from 'lodash';
import { Fragment, useState } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import Badge from 'calypso/components/badge';
import ExternalLink from 'calypso/components/external-link';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

const DatacenterOptions = [
	{
		value: undefined,
		label: translate( 'Automatically place my site in the best datacenter' ),
	},
	{
		value: 'ams',
		label: translate( 'Amsterdam (AMS)' ),
	},
	{
		value: 'bur',
		label: translate( 'Burbank, California (BUR)' ),
	},
	{
		value: 'dfw',
		label: translate( 'Dallas-Fort Worth, Texas (DFW)' ),
	},
	{
		value: 'dca',
		label: translate( 'Washington, D.C. (DCA)' ),
	},
];

export const WarningList = ( { context, translate, warnings, showContact = true }: Props ) => {
	const hasDomainNamesWarning = warnings.some( ( warning ) => warning?.domainNames );
	const hasAdvancedOptions = hasDomainNamesWarning;
	const [ showingAdvancedOptions, setShowingAdvancedOptions ] = useState( false );
	return (
		<div>
			{ getWarningDescription( context, warnings.length, translate ) && (
				<div className="eligibility-warnings__warning">
					<div className="eligibility-warnings__message">
						<span className="eligibility-warnings__message-description">
							{ getWarningDescription( context, warnings.length, translate ) }
						</span>
					</div>
				</div>
			) }

			{ map( warnings, ( { name, description, supportUrl, domainNames }, index ) => (
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

			{ hasAdvancedOptions && (
				<div className="eligibility-warnings__warning">
					<div className="eligibility-warnings__message">
						{ showingAdvancedOptions && (
							<Fragment>
								<span className="eligibility-warnings__message-title">
									{ translate( 'Advanced Options' ) }
								</span>
								<span className="eligibility-warnings__message-description">
									{ hasDomainNamesWarning && <DatacenterPicker /> }
								</span>
							</Fragment>
						) }
						{ ! showingAdvancedOptions && (
							<button
								className="eligibility-warnings__inline-link"
								onClick={ () => setShowingAdvancedOptions( true ) }
							>
								{ translate( 'Show advanced options' ) }
							</button>
						) }
					</div>
				</div>
			) }

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

function DatacenterPicker() {
	return (
		<div className="eligibility-warnings__datacenter-picker">
			{ translate( 'Choose a datacenter for your site:' ) }
			<form>
				{ DatacenterOptions.map( ( option ) => {
					return (
						<label>
							<input class="form-radio" name="datacenter" type="radio" value={ option.value } />
							{ option.label }
						</label>
					);
				} ) }
			</form>
		</div>
	);
}

function getWarningDescription(
	context: string | null,
	warningCount: number,
	translate: LocalizeProps[ 'translate' ]
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

		default:
			return defaultCopy;
	}
}

export default localize( WarningList );
