/**
 * External dependencies
 */
import React from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';
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

export const WarningList = ( { translate, warnings }: Props ) => (
	<div>
		<div className="eligibility-warnings__warning">
			<Gridicon icon="notice-outline" size={ 24 } />
			<div className="eligibility-warnings__message">
				<span className="eligibility-warnings__message-description">
					{ translate(
						"This feature isn't (yet) compatible with Plugin uploads and will be disabled:",
						"These features aren't (yet) compatible with Plugin uploads and will be disabled:",
						{
							count: warnings.length,
							args: warnings.length,
						}
					) }
				</span>
			</div>
		</div>

		{ map( warnings, ( { name, description, supportUrl }, index ) => (
			<div className="eligibility-warnings__warning" key={ index }>
				<div className="eligibility-warnings__message eligibility-warnings__message--indented">
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
			<div className="eligibility-warnings__message eligibility-warnings__message--indented">
				<span className="eligibility-warnings__message-title">{ translate( 'Questions?' ) }</span>
				:&nbsp;
				<span className="eligibility-warnings__message-description">
					{ translate( '{{a}}Contact support{{/a}} for help.', {
						components: {
							a: <ActionPanelLink href="/help/contact" />,
						},
					} ) }
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
