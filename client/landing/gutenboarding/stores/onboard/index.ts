import { Onboard } from '@automattic/data-stores';
import { SITE_STORE } from '../site';

export const ONBOARD_STORE = Onboard.register( SITE_STORE );
