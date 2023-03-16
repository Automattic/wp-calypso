import { SubscriptionManagerContainer as SubscriptionManager } from './components/SubscriptionManagerContainer';
import { TabsSwitcher } from './components/TabsSwitcher';
import { UserSettings } from './components/UserSettings';
import { EmailFormatInput } from './components/fields/EmailFormatInput';

export default Object.assign( SubscriptionManager, {
	EmailFormatInput,
	TabsSwitcher,
	UserSettings,
} );
