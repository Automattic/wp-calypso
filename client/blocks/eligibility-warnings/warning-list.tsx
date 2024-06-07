import { Card, Badge } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize, LocalizeProps, translate } from 'i18n-calypso';
import React, { useState, Fragment } from 'react';
import ActionPanelLink from 'calypso/components/action-panel/link';
import ExternalLink from 'calypso/components/external-link';
import { setAdminInterfaceStyle } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/sensei-launch/launch-completion-tasks';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { DomainNames, EligibilityWarning } from 'calypso/state/automated-transfer/selectors';

interface ExternalProps {
	context: string | null;
	warnings: EligibilityWarning[];
	showContact?: boolean;
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( { context, translate, warnings, showContact = true }: Props ) => {
	const [ isAdminStyleEnabled, setAdminStyleEnabled ] = useState( true ); // State to track toggle

	// Function to handle toggle changes
	const handleAdminStyleToggle = ( checkedValue: boolean ) => {
		console.log( 'checkedValue', checkedValue );
		setAdminStyleEnabled( checkedValue );
		const siteId = getSelectedSiteId( getState() );
		console.log( 'siteId', siteId );

		if ( siteId !== null ) {
			const adminStyle = checkedValue ? 'wp-admin' : 'calypso';
			setAdminInterfaceStyle( siteId, adminStyle );
		}
	};

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

			{ warnings.map( ( { id, name, description, supportUrl, domainNames }, index ) => (
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
							{ id === 'wordpress_admin_style' && (
								<div>
									<ToggleControl
										checked={ isAdminStyleEnabled }
										onChange={ handleAdminStyleToggle }
										disabled={ false }
										label={ translate( 'Use the Classic WP-Admin style' ) }
									/>
								</div>
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

		case 'dev-tools':
			return translate(
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
