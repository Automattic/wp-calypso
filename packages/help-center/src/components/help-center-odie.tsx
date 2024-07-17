/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { Gridicon } from '@automattic/components';
import { OdieAssistant, useOdieAssistantContext, EllipsisMenu } from '@automattic/odie-client';
import { useI18n } from '@wordpress/react-i18n';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export function HelpCenterOdie(): JSX.Element {
	const { __ } = useI18n();
	const { clearChat } = useOdieAssistantContext();

	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" backToRoot />
				<EllipsisMenu popoverClassName="help-center__container-header-menu" position="bottom">
					<PopoverMenuItem
						onClick={ clearChat }
						className="help-center__container-header-menu-item"
					>
						<Gridicon icon="comment" />
						{ __( 'Clear Conversation' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
			<OdieAssistant />
		</div>
	);
}
