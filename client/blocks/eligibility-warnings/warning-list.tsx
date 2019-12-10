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

export default localize( WarningList );
