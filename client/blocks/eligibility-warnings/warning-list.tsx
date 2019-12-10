/**
 * External dependencies
 */
import React from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

interface ExternalProps {
	context: string | null;
	warnings: import('state/automated-transfer/selectors').EligibilityWarning[];
}

type Props = ExternalProps & LocalizeProps;

export const WarningList = ( { translate, warnings }: Props ) => (
	<>
		{ warnings.map( ( { description, supportUrl }, index ) => (
			<Notice status="is-warning" key={ index } text={ description } showDismiss={ false }>
				{ supportUrl && (
					<NoticeAction
						icon="help-outline"
						aria-label={ translate( 'Help' ) }
						href={ supportUrl }
						external
					/>
				) }
			</Notice>
		) ) }
	</>
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
