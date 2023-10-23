/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { OdieAssistantProvider, noop } from 'calypso/odie/context';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export const HelpCenterOdie = () => {
	const { __ } = useI18n();
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
				<EllipsisMenu popoverClassName="help-center__container-header-menu" position="bottom">
					<PopoverMenuItem onClick={ noop } className="help-center__container-header-menu-item">
						<Gridicon icon="comment" />
						{ __( 'Start a New Chat' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ noop } className="help-center__container-header-menu-item">
						<Gridicon icon="mail" />
						{ __( 'Send Transcript to Email' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
			<OdieAssistantProvider sectionName="help-center" botSetting="supportDocs" botName="Wapuu" />
		</div>
	);
};
