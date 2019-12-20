/**
 * External dependencies
 */
import React from 'react';
import i18n, { localize, LocalizeProps } from 'i18n-calypso';
const hasTranslation = ( message: string ) => i18n.hasTranslation( message );
import { map } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import ActionPanelLink from 'components/action-panel/link';

interface ExternalProps {
	context: string | null;
	warnings: import('state/automated-transfer/selectors').EligibilityWarning[];
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( { context, translate, warnings }: Props ) => (
	<div>
		<div className="eligibility-warnings__warning">
			<Gridicon icon="notice-outline" size={ 24 } />
			<div className="eligibility-warnings__message">
				<span className="eligibility-warnings__message-description">
					{ getWarningDescription( context, warnings.length, translate ) }
				</span>
			</div>
		</div>

		{ map( warnings, ( { name, description, supportUrl }, index ) => (
			<div className="eligibility-warnings__warning" key={ index }>
				<div className="eligibility-warnings__message">
					<span className="eligibility-warnings__message-title">{ name }</span>
					:&nbsp;
					<span className="eligibility-warnings__message-description">
						{ description }{ ' ' }
						{ supportUrl && (
							<ExternalLink href={ supportUrl } target="_blank" rel="noopener noreferrer">
								{ translate( 'Learn more.' ) }
							</ExternalLink>
						) }
					</span>
				</div>
			</div>
		) ) }

		<div className="eligibility-warnings__warning">
			<div className="eligibility-warnings__message">
				<span className="eligibility-warnings__message-title">
					{ hasTranslation( 'Questions?' )
						? translate( 'Questions?' )
						: translate( 'Any Questions?' ) }
				</span>
				:&nbsp;
				<span className="eligibility-warnings__message-description">
					{ hasTranslation( '{{a}}Contact support{{/a}} for help.' ) ? (
						translate( '{{a}}Contact support{{/a}} for help.', {
							components: {
								a: <ActionPanelLink href="/help/contact" />,
							},
						} )
					) : (
						<ActionPanelLink href="/help/contact">
							{ translate( 'Contact support' ) }
						</ActionPanelLink>
					) }
				</span>
			</div>
		</div>
	</div>
);

function getWarningDescription(
	context: string | null,
	warningCount: number,
	translate: LocalizeProps[ 'translate' ]
) {
	const defaultCopy = translate(
		"By proceeding you'll lose %d feature:",
		"By proceeding you'll lose these %d features:",
		{
			count: warningCount,
			args: warningCount,
		}
	);
	switch ( context ) {
		case 'plugins':
			return hasTranslation(
				"This feature isn't (yet) compatible with plugin uploads and will be disabled:"
			)
				? translate(
						"This feature isn't (yet) compatible with plugin uploads and will be disabled:",
						"These features aren't (yet) compatible with plugin uploads and will be disabled:",
						{
							count: warningCount,
							args: warningCount,
						}
				  )
				: defaultCopy;

		case 'themes':
			return hasTranslation(
				"This feature isn't (yet) compatible with theme uploads and will be disabled:"
			)
				? translate(
						"This feature isn't (yet) compatible with theme uploads and will be disabled:",
						"These features aren't (yet) compatible with theme uploads and will be disabled:",
						{
							count: warningCount,
							args: warningCount,
						}
				  )
				: defaultCopy;

		case 'hosting':
			return hasTranslation(
				"This feature isn't (yet) compatible with hosting access and will be disabled:"
			)
				? translate(
						"This feature isn't (yet) compatible with hosting access and will be disabled:",
						"These features aren't (yet) compatible with hosting access and will be disabled:",
						{
							count: warningCount,
							args: warningCount,
						}
				  )
				: defaultCopy;

		default:
			return null;
	}
}

export default localize( WarningList );
