/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import OdieAssistant from 'calypso/odie';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export const HelpCenterOdie = () => {
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
			</div>
			<OdieAssistant />
		</div>
	);
};
