import './src/config';
import { HelpCenter } from '@automattic/data-stores';
import './src/help-center';
export { whatsNewQueryClient } from './src/help-center';

HelpCenter.register();
