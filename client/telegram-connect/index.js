import page from '@automattic/calypso-router';
import { LEGACY_TELEGRAM_CONNECT_PATH, redirectLegacyTelegramConnect } from './controller';

export default function () {
	page( `${ LEGACY_TELEGRAM_CONNECT_PATH }*`, redirectLegacyTelegramConnect );
}
